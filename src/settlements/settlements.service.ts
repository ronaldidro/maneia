import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual } from 'typeorm';

@Injectable()
export class SettlementsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(group: string, payer: string, userId: string): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const expenseRepository = manager.getRepository(Expense);
      const detailRepository = manager.getRepository(ExpenseDetail);

      const expensesToUpdate: Expense[] = [];
      const detailsToRemove: ExpenseDetail[] = [];
      const expensesToRemove: Expense[] = [];

      const expenses = await expenseRepository.find({
        where: {
          user: { id: userId },
          group: { id: group },
          expensedAt: LessThanOrEqual(new Date()),
        },
        relations: { details: { user: true } },
        order: { expensedAt: 'ASC' },
      });

      for (const expense of expenses) {
        const detail = expense.details.find(
          (detail) => detail.user.id === payer,
        );

        if (!detail) continue;

        if (expense.details.length === 1 && !expense.splitted) {
          expensesToRemove.push(expense);
          continue;
        }

        expense.amount = (
          Number(expense.amount) - Number(detail.amount)
        ).toFixed(2);

        expensesToUpdate.push(expense);
        detailsToRemove.push(detail);
      }

      await Promise.all([
        expenseRepository.save(expensesToUpdate),
        detailRepository.remove(detailsToRemove),
        expenseRepository.remove(expensesToRemove),
      ]);
    });
  }
}
