import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserEntity } from '../users/user.entity';
import type { AuthTokens } from 'shared-types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register with email + password' })
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username/email + password' })
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  async sendOtp(@Body() dto: SendOtpDto): Promise<{ message: string; devOtp?: string }> {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login (or auto-register)' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokens> {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    const decoded = JSON.parse(
      Buffer.from(dto.refreshToken.split('.')[1]!, 'base64').toString(),
    ) as { sub: string };
    return this.authService.refreshTokens(decoded.sub, dto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  async me(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@CurrentUser() user: UserEntity): Promise<void> {
    return this.authService.logout(user.id);
  }
}
