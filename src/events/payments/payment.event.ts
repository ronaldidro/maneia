import { MailTemplate } from '@/mailer/interfaces';

export class PaymentEvent {
  constructor(
    public readonly mail: {
      subject: string;
      template: MailTemplate;
    },
    public readonly payment: {
      id: string;
      payer: { firstName: string; email: string };
      description: string;
      group: { name: string };
      creditor: { firstName: string };
      method: string;
      createdAt: Date;
      debt: string;
      amount: string;
      remaining: string;
    },
  ) {}
}
