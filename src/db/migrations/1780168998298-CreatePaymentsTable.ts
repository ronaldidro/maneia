import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1780168998298 implements MigrationInterface {
  name = 'CreatePaymentsTable1780168998298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payments_method_enum" AS ENUM('transfer', 'cash', 'yape')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "description" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "debt" numeric(12,2) NOT NULL, "method" "public"."payments_method_enum" NOT NULL, "group_id" uuid, "user_id" uuid, "payer_id" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02f8e8d4094492641ad95010ca" ON "payments" ("payer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427785468fb7d2733f59e7d7d3" ON "payments" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_921c6d19b1de7071743a06f50f" ON "payments" ("group_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_921c6d19b1de7071743a06f50fc" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_02f8e8d4094492641ad95010ca1" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_02f8e8d4094492641ad95010ca1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_921c6d19b1de7071743a06f50fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_921c6d19b1de7071743a06f50f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_427785468fb7d2733f59e7d7d3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02f8e8d4094492641ad95010ca"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
  }
}
