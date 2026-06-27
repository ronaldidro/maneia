import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { MailTemplate, MailTemplates } from '@/mailer/interfaces';

export class CreateMailerDto<T extends MailTemplate = MailTemplate> {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  template: T;

  @IsNotEmpty()
  @IsObject()
  data: MailTemplates[T];
}
