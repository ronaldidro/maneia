import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerService } from '@/mailer/mailer.service';
import { MailerConsumer } from '@/mailer/mailer.consumer';
import { ExpensesModule } from '@/expenses/expenses.module';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'mailer' }),
    ExpensesModule,
    PaymentsModule,
  ],
  providers: [MailerService, MailerConsumer],
  exports: [BullModule],
})
export class MailerModule {}
