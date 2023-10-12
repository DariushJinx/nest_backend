import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1696689353471 implements MigrationInterface {
    name = 'UpdateUserTable1696689353471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'USER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
