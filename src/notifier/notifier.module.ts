import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { NotifierService } from '@/notifier/notifier.service';
import { NotifierConsumer } from '@/notifier/notifier.consumer';

@Module({
  imports: [
    HttpClientModule.register({ timeout: '5s' }),
    BullModule.registerQueue({ name: 'notifier' }),
  ],
  providers: [NotifierService, NotifierConsumer],
  exports: [NotifierService],
})
export class NotifierModule {}
