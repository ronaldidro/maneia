import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpensesTables1779334607282 implements MigrationInterface {
  name = 'CreateExpensesTables1779334607282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "expense-details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "amount" numeric(12,2) NOT NULL, "user_id" uuid, "expense_id" uuid, CONSTRAINT "PK_8f0c2f6499f73d48788a738f066" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19ea630c0f02100bbcd37e9d68" ON "expense-details" ("expense_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "description" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "expensed_at" TIMESTAMP NOT NULL, "user_id" uuid, "group_id" uuid, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e483e66e0156fbd0e1ca5cb33" ON "expenses" ("group_id", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "expense-details" ADD CONSTRAINT "FK_26efd8a03881564e2f1a0e1b6ed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense-details" ADD CONSTRAINT "FK_8a4dd20baa6150b449ba9b6329d" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" ADD CONSTRAINT "FK_d4e9271763ee685f5d746a4e550" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_d4e9271763ee685f5d746a4e550"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_49a0ca239d34e74fdc4e0625a78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense-details" DROP CONSTRAINT "FK_8a4dd20baa6150b449ba9b6329d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense-details" DROP CONSTRAINT "FK_26efd8a03881564e2f1a0e1b6ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e483e66e0156fbd0e1ca5cb33"`,
    );
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_19ea630c0f02100bbcd37e9d68"`,
    );
    await queryRunner.query(`DROP TABLE "expense-details"`);
  }
}
