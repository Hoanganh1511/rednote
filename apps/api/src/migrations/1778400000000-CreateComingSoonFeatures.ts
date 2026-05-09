import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComingSoonFeatures1778400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "coming_soon_features" (
        "id"          uuid             NOT NULL DEFAULT gen_random_uuid(),
        "key"         character varying NOT NULL,
        "title"       character varying NOT NULL,
        "description" text             NOT NULL,
        "launch_date" date             DEFAULT NULL,
        "enabled"     boolean          NOT NULL DEFAULT true,
        "created_at"  TIMESTAMP        NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP        NOT NULL DEFAULT now(),
        CONSTRAINT "pk_coming_soon_features" PRIMARY KEY ("id"),
        CONSTRAINT "uq_coming_soon_features_key" UNIQUE ("key")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "coming_soon_features" ("key", "title", "description") VALUES
      ('/account/watch-history', 'Lịch sử xem',        'Xem lại toàn bộ video bạn đã xem, theo dõi tiến độ và thời gian xem gần nhất của từng video.'),
      ('/account/favorites',     'Yêu thích',           'Lưu lại những video yêu thích để dễ dàng tìm lại và chia sẻ với bạn bè.'),
      ('/account/watch-later',   'Xem sau',             'Lưu video vào danh sách xem sau để xem lại khi bạn có thời gian.'),
      ('/account/invite',        'Mời bạn bè',          'Mời bạn bè tham gia RedNote qua link giới thiệu và nhận phần thưởng đặc biệt cho cả hai.'),
      ('/account/notifications', 'Cài đặt thông báo',   'Tuỳ chỉnh các loại thông báo về video mới, bình luận, lượt theo dõi và tin nhắn mà bạn muốn nhận.'),
      ('/account/profile',       'Không gian cá nhân',  'Trang hồ sơ sáng tạo của bạn — nơi đăng tải video, bài viết ngắn và kết nối với cộng đồng RedNote.')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "coming_soon_features"`);
  }
}
