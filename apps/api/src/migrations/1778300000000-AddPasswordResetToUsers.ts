import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetToUsers1778300000000 implements MigrationInterface {
    name = 'AddPasswordResetToUsers1778300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token" character varying DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_expires_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token"`);
    }
}
