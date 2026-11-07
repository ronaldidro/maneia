import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscordWebhookToGroupsTable1794072003066 implements MigrationInterface {
  name = 'AddDiscordWebhookToGroupsTable1794072003066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "groups" ADD "discord_webhook" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "groups" DROP COLUMN "discord_webhook"`,
    );
  }
}
