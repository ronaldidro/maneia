import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClosedAtToPaymentsTable1790465382841 implements MigrationInterface {
  name = 'AddClosedAtToPaymentsTable1790465382841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "closed_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`UPDATE "payments" SET "closed_at" = "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "closed_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('expense_created', 'expense_deleted', 'payment_created', 'payment_deleted', 'budget_exceeded', 'budget_tight')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('expense_created', 'expense_deleted', 'payment_created', 'budget_exceeded', 'budget_tight')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "closed_at"`);
  }
}
