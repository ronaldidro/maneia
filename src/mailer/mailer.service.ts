import { Injectable } from '@nestjs/common';
import { CreateMailerDto } from './dto/create-mailer.dto';
import { gmail_v1, google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer';

@Injectable()
export class MailerService {
  private gmail: gmail_v1.Gmail;

  constructor() {
    const oauth2Client = new google.auth.OAuth2({
      client_id: process.env.MAIL_CLIENT_ID,
      client_secret: process.env.MAIL_CLIENT_SECRET,
    });

    oauth2Client.setCredentials({
      refresh_token: process.env.MAIL_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async sendMail(createMailerDto: CreateMailerDto) {
    try {
      const mail = new MailComposer({
        from: 'nobody@gmail.com',
        textEncoding: 'base64',
        ...createMailerDto,
      });

      const message = await mail.compile().build();

      const raw = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      });

      console.log('Email sent successfully:', result.data.id);
      return result.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
