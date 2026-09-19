import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  @Cron(CronExpression.EVERY_12_HOURS)
  checkLimit() {
    this.logger.debug('Called every 30 minutes');
  }
}
