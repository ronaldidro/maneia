import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';
import { CreateMailerDto } from '@/mailer/dto/create-mailer.dto';
import { MailTemplate, MailTemplates } from '@/mailer/interfaces';

@Injectable()
export class MailerService {
  private readonly gmail: gmail_v1.Gmail;

  constructor(private readonly configService: ConfigService) {
    const oauth2Client = new google.auth.OAuth2({
      client_id: this.configService.get<string>('mailer.client_id'),
      client_secret: this.configService.get<string>('mailer.client_secret'),
    });

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('mailer.refresh_token'),
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async send<T extends MailTemplate>(
    createMailerDto: CreateMailerDto<T>,
  ): Promise<gmail_v1.Schema$Message> {
    const raw = await this.getRawMessage(createMailerDto);

    const result = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    return result.data;
  }

  private async getRawMessage<T extends MailTemplate>(
    createMailerDto: CreateMailerDto<T>,
  ): Promise<string> {
    const mail = new MailComposer({
      subject: createMailerDto.subject,
      from: this.configService.get<string>('mailer.sender'),
      to: createMailerDto.to,
      html: await this.getTemplate(
        createMailerDto.template,
        createMailerDto.data,
      ),
    });

    const message = await mail.compile().build();

    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private async getTemplate<T extends MailTemplate>(
    name: T,
    data: MailTemplates[T],
  ): Promise<string> {
    let html = await readFile(
      join(__dirname, 'templates', `${name}.html`),
      'utf8',
    );

    const url = this.configService.get<string>('client.url');

    const templateData = { ...data, url };

    for (const [key, value] of Object.entries(templateData)) {
      html = html.replaceAll(`{{${key}}}`, String(value));
    }

    return html;
  }
}
