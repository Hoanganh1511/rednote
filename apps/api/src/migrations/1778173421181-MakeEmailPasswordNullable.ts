import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEmailPasswordNullable1778173421181 implements MigrationInterface {
    name = 'MakeEmailPasswordNullable1778173421181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "display_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "display_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
    }

}
