import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  // @Cron(CronExpression.EVERY_30_SECONDS)
  @Cron('0 */20 * * * *')
  handleCron() {
    this.logger.debug('Called every 20 minutes');
  }
}
