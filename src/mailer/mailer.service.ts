import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateMailer } from '@/mailer/create-mailer';
import { MailProcess, MailTemplate } from '@/mailer/interfaces';

@Injectable()
export class MailerService {
  constructor(
    @InjectQueue('mailer')
    private readonly mailerQueue: Queue,
  ) {}

  async send<T extends MailTemplate>(
    process: MailProcess,
    mailer: CreateMailer<T>,
  ) {
    await this.mailerQueue.add(process, mailer);
  }
}
