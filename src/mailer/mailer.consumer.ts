import type { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { MailerService } from '@/mailer/mailer.service';
import { CreateMailer } from '@/mailer/create-mailer';

@Processor('mailer')
export class MailerConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send')
  async send(job: Job<CreateMailer>) {
    await this.mailerService.send(job.data);
  }
}
