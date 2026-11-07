import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerService } from '@/mailer/mailer.service';
import { GmailService } from '@/mailer/gmail.service';
import { MailerConsumer } from '@/mailer/mailer.consumer';
import { ExpensesModule } from '@/expenses/expenses.module';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'mailer' }),
    ExpensesModule,
    PaymentsModule,
  ],
  providers: [MailerService, GmailService, MailerConsumer],
  exports: [MailerService],
})
export class MailerModule {}
