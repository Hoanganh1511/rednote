import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import type { Redis } from 'ioredis';
import { UsersService } from '../users/users.service';
import { SmsService } from './sms.service';
import { MailerService } from '../mailer/mailer.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { SendOtpDto } from './dto/send-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import type { AuthTokens } from 'shared-types';

const OTP_TTL_SECONDS = 120;
const PHONE_OTP_TTL_SECONDS = 120;
const EMAIL_OTP_TTL_SECONDS = 600;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
    private readonly mailerService: MailerService,
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
        passwordHash: null,
      });
    }

    return this.issueTokens(user.id, user.email ?? user.id);
  }

  async sendEmailBindOtp(userId: string, email: string): Promise<{ devOtp?: string }> {
    const existing = await this.usersService.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(
      `email-otp:${userId}`,
      JSON.stringify({ code, email }),
      'EX',
      EMAIL_OTP_TTL_SECONDS,
    );
    await this.mailerService.sendEmailBindOtp(email, code);

    if (this.config.get('NODE_ENV') !== 'production') {
      return { devOtp: code };
    }
    return {};
  }

  async verifyEmailBindOtp(userId: string, email: string, code: string): Promise<void> {
    const raw = await this.redis.get(`email-otp:${userId}`);
    if (!raw) throw new BadRequestException('Mã OTP đã hết hạn, vui lòng gửi lại');

    const stored = JSON.parse(raw) as { code: string; email: string };
    if (stored.code !== code || stored.email !== email) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email đã được sử dụng bởi tài khoản khác');
    }

    await this.redis.del(`email-otp:${userId}`);
    await this.usersService.saveEmail(userId, email);
  }

  async sendPhoneBindOtp(userId: string, phoneNumber: string): Promise<{ devOtp?: string }> {
    const existing = await this.usersService.findByPhone(phoneNumber);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Số điện thoại đã được sử dụng bởi tài khoản khác');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(
      `phone-otp:${userId}`,
      JSON.stringify({ code, phoneNumber }),
      'EX',
      PHONE_OTP_TTL_SECONDS,
    );
    await this.smsService.sendOtp(phoneNumber, code);

    if (this.config.get('NODE_ENV') !== 'production') {
      return { devOtp: code };
    }
    return {};
  }

  async verifyPhoneBindOtp(userId: string, phoneNumber: string, code: string): Promise<void> {
    const raw = await this.redis.get(`phone-otp:${userId}`);
    if (!raw) throw new BadRequestException('Mã OTP đã hết hạn, vui lòng gửi lại');

    const stored = JSON.parse(raw) as { code: string; phoneNumber: string };
    if (stored.code !== code || stored.phoneNumber !== phoneNumber) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    const existing = await this.usersService.findByPhone(phoneNumber);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Số điện thoại đã được sử dụng bởi tài khoản khác');
    }

    await this.redis.del(`phone-otp:${userId}`);
    await this.usersService.savePhone(userId, phoneNumber);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // silent — không lộ thông tin email tồn tại hay không

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await this.usersService.setPasswordResetToken(user.id, token, expiresAt);

    const frontendUrl = this.config.getOrThrow('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await this.mailerService.sendPasswordReset(email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(user.id, passwordHash);
    await this.usersService.clearPasswordResetToken(user.id);
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
