import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetSocialData1780000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM notifications`);

    await queryRunner.query(`DELETE FROM post_likes`);
    await queryRunner.query(`UPDATE posts SET like_count = 0`);
    await queryRunner.query(`UPDATE users SET total_likes_received = 0`);

    await queryRunner.query(`DELETE FROM follows`);
    await queryRunner.query(`UPDATE users SET follower_count = 0, following_count = 0`);

    // Comments — chỉ xóa nếu bảng tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
          DELETE FROM comments;
        END IF;
      END $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Không thể khôi phục dữ liệu đã xóa
  }
}
