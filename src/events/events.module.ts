import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListener } from '@/events/event.listener';
import { MailerModule } from '@/mailer/mailer.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    NotificationsModule,
    MailerModule,
  ],
  providers: [EventListener],
})
export class EventsModule {}
