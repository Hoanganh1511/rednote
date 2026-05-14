import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetDataFinal1779900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Reset all likes
    await queryRunner.query(`DELETE FROM post_likes`);
    await queryRunner.query(`UPDATE posts SET like_count = 0`);
    await queryRunner.query(`UPDATE users SET total_likes_received = 0`);

    // Reset all follows
    await queryRunner.query(`DELETE FROM follows`);
    await queryRunner.query(`UPDATE users SET follower_count = 0, following_count = 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down migration - cannot restore deleted data
  }
}
