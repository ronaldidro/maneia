import type { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { MailerService } from '@/mailer/mailer.service';
import { CreateMailer } from '@/mailer/create-mailer';
import { ExpensesService } from '@/expenses/expenses.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Processor('mailer')
export class MailerConsumer {
  constructor(
    private readonly mailerService: MailerService,
    private readonly expensesService: ExpensesService,
  ) {}

  @Process('send-expense')
  async send(job: Job<CreateMailer>) {
    const { data: mailer } = job;

    const content = await this.expensesService.findReport(
      { group: mailer.data.groupId, user: mailer.data.debtorId },
      mailer.currentUser,
    );

    const currentDate = format(new Date(), 'yyyy-MM-dd-hh:mm', { locale: es });
    const filename = `gastos-${currentDate}.pdf`;

    await this.mailerService.send({
      ...mailer,
      attachments: [{ filename, content }],
    });
  }
}
