import { MailTemplate } from '@/mailer/interfaces';
import { User } from '@/users/entities/user.entity';

export class ExpenseEvent {
  constructor(
    public readonly currentUser: User,
    public readonly mail: {
      subject: string;
      template: MailTemplate;
    },
    public readonly expense: {
      description: string;
      group: { id: string; name: string };
      payer: { firstName: string };
      createdAt: Date;
      deletedAt?: Date;
      amount: string;
      details: {
        user: { id: string; firstName: string; email: string };
        amount: string;
      }[];
    },
  ) {}
}
