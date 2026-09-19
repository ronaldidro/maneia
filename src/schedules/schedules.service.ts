import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    this.logger.debug('Called every 10 minutes');
  }
}
