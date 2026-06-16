import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import {
  ExpenseSummaryDetailDto,
  ExpenseSummaryDto,
} from '@/summaries/dto/summary.dto';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {}

  async findAll(user: User): Promise<ExpenseSummaryDto> {
    const totalExpensesBuilder = this.repository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount),0)', 'amount')
      .where('expense.user_id = :id', { id: user.id })
      .getRawOne<{ amount: string }>();

    const totalDebtsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :id', { id: user.id })
      .andWhere('detail.user_id != expense.user_id')
      .getRawOne<{ amount: string }>();

    const debtorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect('debtor.firstName', 'firstName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :id', { id: user.id })
      .andWhere('detail.user_id != expense.user_id')
      .groupBy('debtor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

    const creditorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect('creditor.firstName', 'firstName')
      .where('detail.user_id = :id', { id: user.id })
      .andWhere('detail.user_id != expense.user_id')
      .groupBy('creditor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

    const userExpensesBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :id', { id: user.id })
      .andWhere('detail.user_id = expense.user_id')
      .getRawOne<{ amount: string }>();

    const [totalExpenses, totalDebts, debtors, creditors, userExpenses] =
      await Promise.all([
        totalExpensesBuilder,
        totalDebtsBuilder,
        debtorsBuilder,
        creditorsBuilder,
        userExpensesBuilder,
      ]);

    return {
      user: user.firstName,
      expenses: Number(totalExpenses?.amount),
      amount: Number(userExpenses?.amount),
      debts: Number(totalDebts?.amount),
      debtors,
      creditors,
    };
  }
}
