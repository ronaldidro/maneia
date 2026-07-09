import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseCreatedEvent } from '@/events/expenses/expense.event';
import { CreateMailer } from '@/mailer/create-mailer';

@Injectable()
export class ExpenseListener {
  constructor(
    @InjectQueue('mailer')
    private readonly mailerQueue: Queue,
  ) {}

  @OnEvent('expense.created')
  async handleExpenseCreatedEvent(payload: ExpenseCreatedEvent) {
    const { expense } = payload;

    for (const detail of expense.details) {
      await this.mailerQueue.add(
        'send',
        new CreateMailer(
          detail.email,
          'Nuevo gasto registrado',
          'expense-created',
          {
            description: expense.description,
            group: expense.group.name,
            payer: expense.payer.firstName,
            date: format(expense.expensedAt, 'dd MMMM yyyy', { locale: es }),
            amount: detail.amount,
          },
        ),
      );
    }
  }
}
