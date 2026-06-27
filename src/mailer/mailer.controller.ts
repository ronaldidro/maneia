import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateMailerDto } from './dto/create-mailer.dto';

@ApiBearerAuth()
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post()
  create(@Body() createMailerDto: CreateMailerDto) {
    return this.mailerService.send(createMailerDto);
  }
}
