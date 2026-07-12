import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseEvent } from '@/events/expenses/expense.event';
import { CreateMailer } from '@/mailer/create-mailer';

@Injectable()
export class ExpenseListener {
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

  private formatDate(date?: Date) {
    return date ? format(date, 'dd MMMM yyyy', { locale: es }) : undefined;
  }
}
