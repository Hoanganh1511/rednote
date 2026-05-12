import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Một số môi trường ghi nhận migration đã chạy nhưng cột chưa tồn tại — đảm bảo lại cho feed không 500.
 */
export class EnsurePostsAttachmentUrls1779100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "attachment_urls" text[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(): Promise<void> {
    /* no-op: không xóa cột để tránh mất dữ liệu */
  }
}
