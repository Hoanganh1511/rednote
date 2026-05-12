import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHomeNavTabs1778900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "home_nav_tabs" (
        "id"          uuid             NOT NULL DEFAULT gen_random_uuid(),
        "slug"        character varying NOT NULL,
        "label"       character varying NOT NULL,
        "sort_order"  integer          NOT NULL DEFAULT 0,
        "enabled"     boolean          NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ      NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMPTZ      NOT NULL DEFAULT now(),
        CONSTRAINT "pk_home_nav_tabs" PRIMARY KEY ("id"),
        CONSTRAINT "uq_home_nav_tabs_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "home_nav_tabs" ("slug", "label", "sort_order") VALUES
      ('posts', 'Post', 0),
      ('videos', 'Video', 1),
      ('suggested', 'Đề xuất', 2),
      ('following', 'Theo dõi', 3),
      ('weekly-highlights', 'Nổi bật tuần này', 4)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "home_nav_tabs"`);
  }
}
