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

      const now = new Date();

      const detailsToSettle = await detailRepository.find({
        where: {
          user: { id: payer },
          expense: {
            user: { id: userId },
            group: { id: group },
            expensedAt: LessThanOrEqual(now),
          },
        },
        relations: {
          user: true,
          expense: { user: true, group: true, details: true },
        },
        order: { expense: { expensedAt: 'ASC' } },
      });

      const detailsToRemove: ExpenseDetail[] = [];
      const expensesToRemove: Expense[] = [];
      const paymentExpenses: PaymentExpense[] = [];

      for (const detail of detailsToSettle) {
        const expense = detail.expense;

        if (expense.details.length === 1 && !expense.splitted) {
          expensesToRemove.push(expense);
        } else {
          detailsToRemove.push(detail);
        }

        paymentExpenses.push(this.mapToPaymentExpense(expense, detail));
      }

      await Promise.all([
        detailsToRemove.length
          ? detailRepository.remove(detailsToRemove)
          : Promise.resolve(),
        expensesToRemove.length
          ? expenseRepository.remove(expensesToRemove)
          : Promise.resolve(),
      ]);

      return paymentExpenses;
    });
  }

  private mapToPaymentExpense(
    expense: Expense,
    detail: ExpenseDetail,
  ): PaymentExpense {
    return {
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
    };
  }
}
