import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@/mailer/mailer.service';
import { MailerConsumer } from '@/mailer/mailer.consumer';
import { ExpensesModule } from '@/expenses/expenses.module';

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
          tls:
            config.get<string>('env') === 'prd'
              ? { rejectUnauthorized: false }
              : undefined,
          maxRetriesPerRequest: 0,
        },
      }),
      inject: [ConfigService],
    }),
    ExpensesModule,
  ],
  providers: [MailerService, MailerConsumer],
  exports: [BullModule],
})
export class MailerModule {}
