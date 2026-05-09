import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
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

  @Post('email/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email for binding (requires auth)' })
  async sendEmailOtp(
    @CurrentUser() user: UserEntity,
    @Body() dto: SendEmailOtpDto,
  ): Promise<{ devOtp?: string }> {
    return this.authService.sendEmailBindOtp(user.id, dto.email);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify email OTP and bind email (requires auth)' })
  async verifyEmailOtp(
    @CurrentUser() user: UserEntity,
    @Body() dto: VerifyEmailOtpDto,
  ): Promise<void> {
    return this.authService.verifyEmailBindOtp(user.id, dto.email, dto.code);
  }

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone for binding (requires auth)' })
  async sendPhoneOtp(
    @CurrentUser() user: UserEntity,
    @Body() dto: SendPhoneOtpDto,
  ): Promise<{ devOtp?: string }> {
    return this.authService.sendPhoneBindOtp(user.id, dto.phoneNumber);
  }

  @Post('phone/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify phone OTP and bind phone number (requires auth)' })
  async verifyPhoneOtp(
    @CurrentUser() user: UserEntity,
    @Body() dto: VerifyPhoneOtpDto,
  ): Promise<void> {
    return this.authService.verifyPhoneBindOtp(user.id, dto.phoneNumber, dto.code);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
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
