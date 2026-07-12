import { Attachment } from 'nodemailer/lib/mailer';
import { MailTemplate, MailTemplates } from '@/mailer/interfaces';
import { User } from '@/users/entities/user.entity';

export class CreateMailer<T extends MailTemplate = MailTemplate> {
  constructor(
    public readonly to: string,
    public readonly subject: string,
    public readonly template: T,
    public readonly data: MailTemplates[T],
    public readonly currentUser: User,
    public readonly attachments?: Attachment[],
  ) {}
}
