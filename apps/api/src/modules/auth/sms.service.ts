import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: Twilio | null = null;
  private readonly fromNumber: string | null = null;
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.isDev = config.get('NODE_ENV') !== 'production';
    const sid = config.get<string>('TWILIO_ACCOUNT_SID');
    const token = config.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = config.get<string>('TWILIO_PHONE_NUMBER') ?? null;

    if (sid && token) {
      this.client = new Twilio(sid, token);
    } else {
      this.logger.warn('Twilio credentials not set — SMS will be logged to console only');
    }
  }

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      this.logger.debug(`[DEV] OTP for ${phoneNumber}: ${code}`);
      return;
    }

    await this.client.messages.create({
      to: phoneNumber,
      from: this.fromNumber,
      body: `[Rednote] Mã xác thực của bạn là: ${code}. Có hiệu lực trong 2 phút.`,
    });
  }
}
