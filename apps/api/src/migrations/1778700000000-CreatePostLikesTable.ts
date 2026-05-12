import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostLikesTable1778700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_post_likes" PRIMARY KEY ("id"),
        CONSTRAINT "uq_post_likes_post_user" UNIQUE ("post_id", "user_id"),
        CONSTRAINT "fk_post_likes_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_post_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_post_likes_post_id" ON "post_likes" ("post_id")`);
    await queryRunner.query(`CREATE INDEX "idx_post_likes_user_id" ON "post_likes" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_post_likes_user_id"`);
    await queryRunner.query(`DROP INDEX "idx_post_likes_post_id"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
  }
}
