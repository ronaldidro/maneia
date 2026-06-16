import { DataSource, LessThanOrEqual } from 'typeorm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { PaymentExpense } from '@/payments/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SettlementsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    group: string,
    payer: string,
    userId: string,
  ): Promise<PaymentExpense[]> {
    return await this.dataSource.transaction(async (manager) => {
      const expenseRepository = manager.getRepository(Expense);
      const detailRepository = manager.getRepository(ExpenseDetail);

      const detailsToRemove: ExpenseDetail[] = [];
      const expensesToRemove: Expense[] = [];
      const paymentExpenses: PaymentExpense[] = [];

      const settleExpenses = await expenseRepository.find({
        where: {
          user: { id: userId },
          group: { id: group },
          expensedAt: LessThanOrEqual(new Date()),
        },
        relations: { details: { user: true }, group: true, user: true },
        order: { expensedAt: 'ASC' },
      });

      for (const expense of settleExpenses) {
        const detail = expense.details.find(
          (detail) => detail.user.id === payer,
        );

        if (!detail) continue;

        if (expense.details.length === 1 && !expense.splitted) {
          expensesToRemove.push(expense);
          continue;
        }

        detailsToRemove.push(detail);

        paymentExpenses.push(this.mapToPaymentExpense(expense, detail));
      }

      await Promise.all([
        detailRepository.remove(detailsToRemove),
        expenseRepository.remove(expensesToRemove),
      ]);

      return paymentExpenses;
    });
  }

  private mapToPaymentExpense = (
    expense: Expense,
    detail: ExpenseDetail,
  ): PaymentExpense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    splitted: expense.splitted,
    expensedAt: format(expense.expensedAt, 'dd MMM yy', { locale: es }),
    group: {
      id: expense.group.id,
      name: expense.group.name,
    },
    owner: {
      id: expense.user.id,
      firstName: expense.user.firstName,
      lastName: expense.user.lastName,
    },
    details: [
      {
        debtor: {
          id: detail.user.id,
          firstName: detail.user.firstName,
          lastName: detail.user.lastName,
        },
        amount: detail.amount,
      },
    ],
  });
}
