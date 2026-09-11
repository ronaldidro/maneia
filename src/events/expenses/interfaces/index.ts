import { MailTemplate } from '@/mailer/interfaces';
import {
  NotificationSeverity,
  NotificationType,
} from '@/notifications/enum/notification.enum';
import { User } from '@/users/entities/user.entity';

export interface ExpenseData {
  id: string;
  description: string;
  group: { id: string; name: string };
  payer: { firstName: string };
  createdAt: Date;
  deletedAt?: Date;
  amount: string;
  details: ExpenseDetailData[];
}

interface ExpenseDetailData {
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
