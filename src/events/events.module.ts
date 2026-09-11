import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExpenseListener } from '@/events/expenses/expense.listener';
import { PaymentListener } from '@/events/payments/payment.listener';
import { EventService } from '@/events/event.service';
import { MailerModule } from '@/mailer/mailer.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [EventEmitterModule.forRoot(), NotificationsModule, MailerModule],
  providers: [EventService, ExpenseListener, PaymentListener],
})
export class EventsModule {}
