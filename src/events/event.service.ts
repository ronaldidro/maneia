import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateMailer } from '@/mailer/create-mailer';
import { MailProcess, MailTemplate } from '@/mailer/interfaces';
import { NotificationsService } from '@/notifications/notifications.service';
import { CreateNotificationDto } from '@/notifications/dto/create-notification.dto';
import { NotificationSeverity } from '@/notifications/enum/notification.enum';
import { NotifierService } from '@/notifier/notifier.service';
import { DiscordWebhookPayload } from '@/notifier/interfaces';
import { MailerService } from '@/mailer/mailer.service';

@Injectable()
export class EventService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly notificationsService: NotificationsService,
    private readonly notifierService: NotifierService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail<T extends MailTemplate>(
    process: MailProcess,
    mailer: CreateMailer<T>,
  ) {
    const isPrdEnv = this.configService.get<boolean>('env.is_prd');
    if (isPrdEnv) await this.mailerService.send(process, mailer);
  }

  async createNotification(
    notification: CreateNotificationDto,
    severity: NotificationSeverity,
  ) {
    await this.notificationsService.create(notification, severity);
  }

  async sendNotification(webhookUrl: string, payload: DiscordWebhookPayload) {
    const isPrdEnv = this.configService.get<boolean>('env.is_prd');
    if (isPrdEnv) await this.notifierService.sendDiscord(webhookUrl, payload);
  }
}
