import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.fromEmail = config.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@rednote.dev';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged to console only');
    }
  }

  async sendEmailBindOtp(to: string, code: string): Promise<void> {
    await this.send(to, '[Rednote] Mã xác thực liên kết email', this.buildOtpEmail(code));
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await this.send(to, '[Rednote] Đặt lại mật khẩu', this.buildResetEmail(resetUrl));
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.debug(`[DEV] Email → ${to} | ${subject}`);
      return;
    }
    await this.resend.emails.send({ from: this.fromEmail, to, subject, html });
  }

  private buildOtpEmail(code: string): string {
    return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#00aeec;margin:0 0 16px;font-size:22px">Xác thực email Rednote</h2>
  <p style="color:#444;margin:0 0 24px;line-height:1.6">Mã xác thực để liên kết email tài khoản của bạn:</p>
  <div style="background:#f0f9ff;border:2px dashed #00aeec;border-radius:12px;padding:28px;text-align:center;margin:0 0 24px">
    <span style="font-size:40px;font-weight:700;letter-spacing:10px;color:#00aeec">${code}</span>
  </div>
  <p style="color:#888;font-size:13px;margin:0;line-height:1.6">Mã có hiệu lực trong <strong>10 phút</strong>. Vui lòng không chia sẻ với bất kỳ ai.</p>
</div>`;
  }

  private buildResetEmail(resetUrl: string): string {
    return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#00aeec;margin:0 0 16px;font-size:22px">Đặt lại mật khẩu Rednote</h2>
  <p style="color:#444;margin:0 0 24px;line-height:1.6">Chúng tôi nhận được yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
  <div style="text-align:center;margin:0 0 32px">
    <a href="${resetUrl}" style="display:inline-block;background:#00aeec;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px">Đặt lại mật khẩu</a>
  </div>
  <p style="color:#888;font-size:13px;margin:0;line-height:1.6">Link có hiệu lực trong <strong>1 giờ</strong>. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Hoặc copy link: <span style="color:#00aeec;word-break:break-all">${resetUrl}</span></p>
</div>`;
  }
}
