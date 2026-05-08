import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnBase: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new S3Client({
      region: config.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: config.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.getOrThrow('S3_BUCKET');
    this.cdnBase = config.getOrThrow('CDN_BASE_URL').replace(/\/$/, '');
  }

  async presignAvatar(
    userId: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    const ext = fileType.split('/')[1] ?? 'jpg';
    const key = `avatars/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${this.cdnBase}/${key}`;

    return { uploadUrl, publicUrl };
  }

  /** Fire-and-forget: xóa object S3 từ URL cũ. Không throw để tránh ảnh hưởng update profile. */
  deleteByUrl(url: string): void {
    const prefix = `${this.cdnBase}/`;
    if (!url.startsWith(prefix)) return; // không phải file của bucket này

    const key = url.slice(prefix.length);
    this.s3
      .send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
      .catch((err: unknown) =>
        this.logger.warn(`Failed to delete S3 object "${key}": ${String(err)}`),
      );
  }
}
