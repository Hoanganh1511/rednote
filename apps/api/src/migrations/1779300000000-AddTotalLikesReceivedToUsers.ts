import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalLikesReceivedToUsers1779300000000 implements MigrationInterface {
  name = 'AddTotalLikesReceivedToUsers1779300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "total_likes_received" integer NOT NULL DEFAULT 0
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "total_likes_received"
    `);
  }
}
