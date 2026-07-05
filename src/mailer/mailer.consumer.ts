import type { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { MailerService } from '@/mailer/mailer.service';
import { CreateMailerDto } from '@/mailer/dto/create-mailer.dto';

@Processor('mailer')
export class MailerConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send')
  async send(job: Job<CreateMailerDto>) {
    await this.mailerService.send(job.data);
  }
}
