import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ExpenseListener } from '@/events/expenses/expense.listener';
import { MailerModule } from '@/mailer/mailer.module';

@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true }), MailerModule],
  providers: [ExpenseListener],
})
export class EventsModule {}
