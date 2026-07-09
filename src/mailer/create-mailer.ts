import { MailTemplate, MailTemplates } from '@/mailer/interfaces';

export class CreateMailer<T extends MailTemplate = MailTemplate> {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly template: T,
    public readonly data: MailTemplates[T],
  ) {}
}
