import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsTable1778500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "post_status_enum" AS ENUM ('draft', 'published')
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "content" text NOT NULL DEFAULT '',
        "image_urls" text[] NOT NULL DEFAULT '{}',
        "hashtags" text[] NOT NULL DEFAULT '{}',
        "location_text" character varying(120),
        "status" "post_status_enum" NOT NULL DEFAULT 'published',
        "published_at" TIMESTAMPTZ,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "pk_posts" PRIMARY KEY ("id"),
        CONSTRAINT "fk_posts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_posts_user_id" ON "posts" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_posts_status" ON "posts" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_posts_status"`);
    await queryRunner.query(`DROP INDEX "idx_posts_user_id"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "post_status_enum"`);
  }
}

