import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateFollowsTable1779400000000 implements MigrationInterface {
  name = 'CreateFollowsTable1779400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'follows',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'follower_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'following_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'follows',
      new TableForeignKey({
        columnNames: ['follower_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'follows',
      new TableForeignKey({
        columnNames: ['following_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        columnNames: ['follower_id', 'deleted_at'],
        name: 'IDX_follows_follower_id_deleted_at',
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        columnNames: ['following_id', 'deleted_at'],
        name: 'IDX_follows_following_id_deleted_at',
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        columnNames: ['follower_id', 'following_id'],
        isUnique: true,
        name: 'UQ_follows_follower_following',
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('follows', 'UQ_follows_follower_following');
    await queryRunner.dropIndex('follows', 'IDX_follows_following_id_deleted_at');
    await queryRunner.dropIndex('follows', 'IDX_follows_follower_id_deleted_at');
    await queryRunner.dropTable('follows');
  }
}
