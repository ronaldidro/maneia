import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@/mailer/mailer.service';
import { MailerController } from './mailer.controller';
import { MailerConsumer } from '@/mailer/mailer.consumer';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'mailer',
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('queue.host'),
          port: config.get<number>('queue.port'),
          username: config.get<string>('queue.user'),
          password: config.get<string>('queue.pass'),
          tls: { rejectUnauthorized: false },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService, MailerConsumer],
  controllers: [MailerController],
  exports: [BullModule],
})
export class MailerModule {}
