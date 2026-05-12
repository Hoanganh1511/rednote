import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { POST_UPLOAD_ALLOWED_MIMES, extensionForPostUploadMime } from './post-upload-mime';

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

  async presignPostImage(
    userId: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    if (!POST_UPLOAD_ALLOWED_MIMES.includes(fileType as (typeof POST_UPLOAD_ALLOWED_MIMES)[number])) {
      throw new BadRequestException('Định dạng file không được hỗ trợ.');
    }
    const ext = extensionForPostUploadMime(fileType);
    const key = `posts/${userId}/${randomUUID()}.${ext}`;

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

  /**
   * Xóa object post upload theo URL công khai — chỉ key `posts/{userId}/...` (UUID.ext),
   * tránh xóa nhầm avatar hoặc file user khác.
   */
  async deletePostUploadUrls(userId: string, urls: string[]): Promise<{ deleted: number; skipped: number }> {
    const prefix = `${this.cdnBase}/`;
    const expectedSegment = `posts/${userId}/`;
    const seenKeys = new Set<string>();
    let deleted = 0;
    let skipped = 0;

    for (const raw of urls) {
      const url = raw.trim();
      if (!url.startsWith(prefix)) {
        skipped++;
        continue;
      }
      const key = url.slice(prefix.length);
      if (key.includes('..') || key.includes('//')) {
        skipped++;
        continue;
      }
      if (!key.startsWith(expectedSegment)) {
        skipped++;
        continue;
      }
      const parts = key.split('/');
      if (parts.length !== 3 || parts[0] !== 'posts' || parts[1] !== userId) {
        skipped++;
        continue;
      }
      const fileName = parts[2];
      if (!fileName || fileName.includes('/') || fileName.includes('..')) {
        skipped++;
        continue;
      }
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      try {
        await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        deleted++;
      } catch (err: unknown) {
        this.logger.warn(`deletePostUploadUrls failed for "${key}": ${String(err)}`);
        skipped++;
      }
    }

    return { deleted, skipped };
  }
}
