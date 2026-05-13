import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoverUrlToUsers1778702157905 implements MigrationInterface {
    name = 'AddCoverUrlToUsers1778702157905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "fk_posts_user_id"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "fk_post_likes_post"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "fk_post_likes_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_follows_follower_id_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_follows_following_id_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_follows_follower_following"`);
        await queryRunner.query(`DROP INDEX "public"."idx_post_likes_post_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_post_likes_user_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "cover_url" text`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum" RENAME TO "post_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" TYPE "public"."posts_status_enum" USING "status"::"text"::"public"."posts_status_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'published'`);
        await queryRunner.query(`DROP TYPE "public"."post_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8109e59f691f0444b43420f698" ON "follows" ("follower_id", "following_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b039d1f99df82aff2645f5676a" ON "follows" ("following_id", "deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_9ea0f8e3eeed9cdd585a0e421d" ON "follows" ("follower_id", "deleted_at") `);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_b40d37469c501092203d285af80" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_b40d37469c501092203d285af80"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ea0f8e3eeed9cdd585a0e421d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b039d1f99df82aff2645f5676a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8109e59f691f0444b43420f698"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "home_nav_tabs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE TYPE "public"."post_status_enum_old" AS ENUM('draft', 'published')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" TYPE "public"."post_status_enum_old" USING "status"::"text"::"public"."post_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'published'`);
        await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."post_status_enum_old" RENAME TO "post_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cover_url"`);
        await queryRunner.query(`CREATE INDEX "idx_post_likes_user_id" ON "post_likes" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_post_likes_post_id" ON "post_likes" ("post_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_follows_follower_following" ON "follows" ("follower_id", "following_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_follows_following_id_deleted_at" ON "follows" ("following_id", "deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_follows_follower_id_deleted_at" ON "follows" ("follower_id", "deleted_at") `);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "fk_post_likes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "fk_post_likes_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "fk_posts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
