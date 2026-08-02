import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseEvent } from '@/events/expenses/expense.event';
import { PaymentEvent } from '@/events/payments/payment.event';
import { CreateMailer } from '@/mailer/create-mailer';

@Injectable()
export class EventListener {
  constructor(
    @InjectQueue('mailer')
    private readonly mailerQueue: Queue,
  ) {}

  @OnEvent('expense.*')
  async handleExpenseEvents(payload: ExpenseEvent) {
    const { expense, mail } = payload;

    for (const detail of expense.details) {
      await this.mailerQueue.add(
        'send-expense',
        new CreateMailer(
          detail.user.email,
          mail.subject,
          mail.template,
          {
            debtorName: detail.user.firstName,
            description: expense.description,
            groupId: expense.group.id,
            group: expense.group.name,
            debtorId: detail.user.id,
            payer: expense.payer.firstName,
            createdAt: this.formatDate(expense.createdAt)!,
            deletedAt: this.formatDate(expense.deletedAt),
            total: expense.amount,
            amount: detail.amount,
          },
          payload.currentUser,
        ),
      );
    }
  }

  @OnEvent('payment.*')
  async handlePaymentEvents(payload: PaymentEvent) {
    const { payment, mail } = payload;

    await this.mailerQueue.add(
      'send-payment',
      new CreateMailer(payment.payer.email, mail.subject, mail.template, {
        paymentId: payment.id,
        payer: payment.payer.firstName,
        description: payment.description,
        group: payment.group.name,
        creditor: payment.creditor.firstName,
        method: payment.method,
        createdAt: this.formatDate(payment.createdAt)!,
        debt: payment.debt,
        amount: payment.amount,
        remaining: payment.remaining,
      }),
    );
  }

  private formatDate(date?: Date) {
    return date ? format(date, 'dd MMMM yyyy', { locale: es }) : undefined;
  }
}
