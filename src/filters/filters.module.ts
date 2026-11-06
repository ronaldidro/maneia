import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { NotifierModule } from '@/notifier/notifier.module';
import { NotifyService } from '@/filters/notify.service';
import { CatchEverythingFilter } from '@/filters/catch-everything.filter';
import { HttpExceptionFilter } from '@/filters/http-exception.filter';

@Module({
  imports: [NotifierModule],
  providers: [
    NotifyService,
    { provide: APP_FILTER, useClass: CatchEverythingFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class FiltersModule {}
