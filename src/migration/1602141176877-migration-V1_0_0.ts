import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationV1001602141176877 implements MigrationInterface {
    name = 'migrationV1001602141176877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image_data" ("id" uuid NOT NULL, "imageLocation" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "additionalData" text NOT NULL, CONSTRAINT "PK_3eb20ad747eb922ebf842c46cfb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "image_data"`);
    }

}
