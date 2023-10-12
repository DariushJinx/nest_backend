import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryTable1696693995195 implements MigrationInterface {
    name = 'CreateCategoryTable1696693995195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "images" text NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
