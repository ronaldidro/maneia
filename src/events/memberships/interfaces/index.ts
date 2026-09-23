import { MailTemplate } from '@/mailer/interfaces';
import {
  NotificationSeverity,
  NotificationType,
} from '@/notifications/enum/notification.enum';

interface Member {
  id: string;
  firstName: string;
  email: string;
}

interface Membership {
  id: string;
  member: Member;
  group: { name: string };
  budget: string;
}

export interface BudgetData {
  membership: Membership;
  total: string;
  exceeded?: string;
  remaining?: string;
}

export interface BudgetMail {
  subject: string;
  template: MailTemplate;
  data: BudgetData;
}

export interface BudgetNotification {
  title: string;
  description: string;
  type: NotificationType.BudgetExceeded | NotificationType.BudgetTight;
  entityId: string;
  user: Member;
  severity: NotificationSeverity;
}
