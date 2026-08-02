import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListener } from '@/events/event.listener';
import { MailerModule } from '@/mailer/mailer.module';

@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true }), MailerModule],
  providers: [EventListener],
})
export class EventsModule {}
