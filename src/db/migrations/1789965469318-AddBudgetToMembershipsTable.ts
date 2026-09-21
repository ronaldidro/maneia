import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBudgetToMembershipsTable1789965469318 implements MigrationInterface {
  name = 'AddBudgetToMembershipsTable1789965469318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD "budget" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "budget"`);
  }
}
