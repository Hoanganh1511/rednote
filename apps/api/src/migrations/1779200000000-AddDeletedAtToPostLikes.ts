import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToPostLikes1779200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post_likes" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN IF EXISTS "deleted_at"`);
  }
}
