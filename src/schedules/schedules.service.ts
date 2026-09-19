import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  @Cron('0 9,21 * * *')
  checkLimit() {
    this.logger.debug('Called 9 and 21 hours');
  }
}
