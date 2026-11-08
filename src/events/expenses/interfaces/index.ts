import { MailTemplate } from '@/mailer/interfaces';
import {
  NotificationSeverity,
  NotificationType,
} from '@/notifications/enum/notification.enum';
import { User } from '@/users/entities/user.entity';

export interface ExpenseData {
  id: string;
  description: string;
  group: { id: string; name: string; discordWebhook?: string };
  payer: { firstName: string };
  createdAt: Date;
  deletedAt?: Date;
  amount: string;
  details: ExpenseDetailData[];
}

export interface ExpenseDetailData {
  user: ExpenseDetailUser;
  amount: string;
}

interface ExpenseDetailUser {
  id: string;
  firstName: string;
  email: string;
}

export interface ExpenseMail {
  subject: string;
  template: MailTemplate;
  expense: ExpenseData;
  detail: ExpenseDetailData;
  currentUser: User;
}

export interface ExpenseNotification {
  title: string;
  description: string;
  type: NotificationType.ExpenseCreated | NotificationType.ExpenseDeleted;
  entityId: string;
  user: ExpenseDetailUser;
  severity: NotificationSeverity;
}

export interface ExpenseDiscordNotification {
  type: NotificationType.ExpenseCreated | NotificationType.ExpenseDeleted;
  webhookUrl: string;
  title: string;
  color: number;
  expense: ExpenseData;
  members: string;
}
