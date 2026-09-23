import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBudgetEnumToNotificationsTable1790050443521 implements MigrationInterface {
  name = 'AddBudgetEnumToNotificationsTable1790050443521';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('expense_created', 'expense_deleted', 'payment_created', 'budget_exceeded', 'budget_tight')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_entity_type_enum" RENAME TO "notifications_entity_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_entity_type_enum" AS ENUM('expense', 'payment', 'membership')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "entity_type" TYPE "public"."notifications_entity_type_enum" USING "entity_type"::"text"::"public"."notifications_entity_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notifications_entity_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_entity_type_enum_old" AS ENUM('expense', 'payment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "entity_type" TYPE "public"."notifications_entity_type_enum_old" USING "entity_type"::"text"::"public"."notifications_entity_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notifications_entity_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_entity_type_enum_old" RENAME TO "notifications_entity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('expense_created', 'expense_deleted', 'payment_created')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`,
    );
  }
}
