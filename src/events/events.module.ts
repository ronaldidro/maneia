import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExpenseListener } from '@/events/expenses/expense.listener';
import { PaymentListener } from '@/events/payments/payment.listener';
import { MembershipListener } from '@/events/memberships/membership.listener';
import { EventService } from '@/events/event.service';
import { MailerModule } from '@/mailer/mailer.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { NotifierModule } from '@/notifier/notifier.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    NotificationsModule,
    MailerModule,
    NotifierModule,
  ],
  providers: [
    EventService,
    ExpenseListener,
    PaymentListener,
    MembershipListener,
  ],
})
export class EventsModule {}
