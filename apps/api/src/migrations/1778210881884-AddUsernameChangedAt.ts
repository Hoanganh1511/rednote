import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameChangedAt1778210881884 implements MigrationInterface {
    name = 'AddUsernameChangedAt1778210881884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username_changed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username_changed_at"`);
    }

}
