import type { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MailerService } from '@/mailer/mailer.service';
import { CreateMailer } from '@/mailer/create-mailer';
import { MailTemplate } from '@/mailer/interfaces';
import { ExpensesService } from '@/expenses/expenses.service';
import { PaymentsService } from '@/payments/payments.service';

@Processor('mailer')
export class MailerConsumer {
  constructor(
    private readonly mailerService: MailerService,
    private readonly expensesService: ExpensesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Process('send-expense')
  async sendExpense(
    job: Job<CreateMailer<'expense-created' | 'expense-deleted'>>,
  ) {
    const { data: mailer } = job;

    const content = await this.expensesService.findReport(
      { group: mailer.data.groupId, user: mailer.data.debtorId },
      mailer.currentUser!,
    );

    const filename = `gastos-${this.getCurrentDate()}.pdf`;

    await this.sendMail({ ...mailer, attachments: [{ filename, content }] });
  }

  @Process('send-payment')
  async sendPayment(job: Job<CreateMailer<'payment-created'>>) {
    const { data: mailer } = job;

    const content = await this.paymentsService.findReport(
      mailer.data.paymentId,
    );

    const filename = `pago-${this.getCurrentDate()}.pdf`;

    await this.sendMail({ ...mailer, attachments: [{ filename, content }] });
  }

  private getCurrentDate() {
    return format(new Date(), 'yyyy-MM-dd-hh:mm', { locale: es });
  }

  private async sendMail<T extends MailTemplate>(mailer: CreateMailer<T>) {
    await this.mailerService.send(mailer);
  }
}
