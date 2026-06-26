import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { CreateMailerDto } from './dto/create-mailer.dto';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(createMailerDto: CreateMailerDto) {
    await this.mailerService.sendMail(createMailerDto);
  }
}
