import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderBirthdayToUsers1778208377098 implements MigrationInterface {
    name = 'AddGenderBirthdayToUsers1778208377098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "birthday" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birthday"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
    }

}
