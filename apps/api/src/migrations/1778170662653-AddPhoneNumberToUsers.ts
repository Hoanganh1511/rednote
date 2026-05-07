import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumberToUsers1778170662653 implements MigrationInterface {
    name = 'AddPhoneNumberToUsers1778170662653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone_number" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_17d1817f241f10a3dbafb169fd" ON "users" ("phone_number") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_17d1817f241f10a3dbafb169fd"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
    }

}
