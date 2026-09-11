import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { CreateMailer } from '@/mailer/create-mailer';
import { MailTemplate } from '@/mailer/interfaces';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateNotificationDto } from '@/notifications/dto/create-notification.dto';
import { NotificationSeverity } from '@/notifications/enum/notification.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectQueue('mailer')
    private readonly mailerQueue: Queue,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addMailJob<T extends MailTemplate>(
    process: string,
    mailer: CreateMailer<T>,
  ) {
    await this.mailerQueue.add(process, mailer);
  }

  async createNotification(
    notification: CreateNotificationDto,
    severity: NotificationSeverity,
  ) {
    await this.notificationsService.create(notification, severity);
  }
}
