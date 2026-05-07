import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import type { Redis } from 'ioredis';
import { UsersService } from '../users/users.service';
import { SmsService } from './sms.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { SendOtpDto } from './dto/send-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import type { AuthTokens } from 'shared-types';

const OTP_TTL_SECONDS = 120;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email already registered');

    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
    });

    return this.issueTokens(user.id, user.email ?? user.id);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const isEmail = dto.identifier.includes('@');
    const user = isEmail
      ? await this.usersService.findByEmail(dto.identifier)
      : await this.usersService.findByUsername(dto.identifier);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email ?? user.id);
  }

  async sendOtp(dto: SendOtpDto): Promise<{ message: string; devOtp?: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${dto.phoneNumber}`, code, 'EX', OTP_TTL_SECONDS);
    await this.smsService.sendOtp(dto.phoneNumber, code);

    if (this.config.get('NODE_ENV') !== 'production') {
      return { message: 'OTP sent', devOtp: code };
    }

    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokens> {
    const stored = await this.redis.get(`otp:${dto.phoneNumber}`);
    if (!stored || stored !== dto.code) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redis.del(`otp:${dto.phoneNumber}`);

    let user = await this.usersService.findByPhone(dto.phoneNumber);
    if (!user) {
      user = await this.usersService.create({
        phoneNumber: dto.phoneNumber,
        username: `user_${Date.now()}`,
        displayName: dto.phoneNumber,
        passwordHash: '',
      });
    }

    return this.issueTokens(user.id, user.email ?? user.id);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);
    if (!user.refreshToken) throw new UnauthorizedException();

    const matches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!matches) throw new UnauthorizedException();

    return this.issueTokens(user.id, user.email ?? user.id);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async issueTokens(userId: string, emailOrId: string): Promise<AuthTokens> {
    const payload = { sub: userId, email: emailOrId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefresh);

    return { accessToken, refreshToken };
  }
}
