import { MailTemplate } from '@/mailer/interfaces';
import {
  NotificationType,
  NotificationSeverity,
} from '@/notifications/enum/notification.enum';

export interface PaymentData {
  id: string;
  payer: PaymentPayer;
  description: string;
  group: { name: string };
  creditor: { firstName: string };
  method: string;
  createdAt: Date;
  debt: string;
  amount: string;
  remaining: string;
}

interface PaymentPayer {
  id: string;
  firstName: string;
  email: string;
}

export interface PaymentMail {
  subject: string;
  template: MailTemplate;
  payment: PaymentData;
}

export interface PaymentNotification {
  title: string;
  description: string;
  type: NotificationType.PaymentCreated;
  entityId: string;
  user: PaymentPayer;
  severity: NotificationSeverity;
}
