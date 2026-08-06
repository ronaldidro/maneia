import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { formatDate } from '@/common/helpers';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import {
  ChartDto,
  DayExpenseDto,
  ExpenseSummaryDetailDto,
  ExpenseSummaryDto,
} from '@/summaries/dto/summary.dto';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {}

  async findAll(user: User): Promise<ExpenseSummaryDto> {
    const totalExpensesBuilder = this.getTotalExpensesBuilder(user.id);
    const totalDebtsBuilder = this.getTotalDebtsBuilder(user.id);
    const debtorsBuilder = this.getDebtorsBuilder(user.id);
    const creditorsBuilder = this.getCreditorsBuilder(user.id);
    const userExpensesBuilder = this.getUserExpensesBuilder(user.id);
    const dayExpensesBuilder = this.getDayExpensesBuilder(user.id);

    const [
      totalExpenses,
      totalDebts,
      debtors,
      creditors,
      userExpenses,
      dayExpenses,
    ] = await Promise.all([
      totalExpensesBuilder,
      totalDebtsBuilder,
      debtorsBuilder,
      creditorsBuilder,
      userExpensesBuilder,
      dayExpensesBuilder,
    ]);

    return {
      user: user.firstName,
      expenses: Number(totalExpenses?.amount),
      amount: Number(userExpenses?.amount),
      debts: Number(totalDebts?.amount),
      debtors,
      creditors,
      chart: this.getChartData(dayExpenses),
    };
  }

  private getTotalExpensesBuilder = (
    userId: string,
  ): Promise<{ amount: string } | undefined> =>
    this.expenseRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount),0)', 'amount')
      .where('expense.user_id = :userId', { userId })
      .getRawOne<{ amount: string }>();

  private getTotalDebtsBuilder = (
    userId: string,
  ): Promise<{ amount: string } | undefined> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId })
      .andWhere('detail.user_id != expense.user_id')
      .getRawOne<{ amount: string }>();

  private getDebtorsBuilder = (
    userId: string,
  ): Promise<ExpenseSummaryDetailDto[]> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect('debtor.firstName', 'firstName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :userId', { userId })
      .andWhere('detail.user_id != expense.user_id')
      .groupBy('debtor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

  private getCreditorsBuilder = (
    userId: string,
  ): Promise<ExpenseSummaryDetailDto[]> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect('creditor.firstName', 'firstName')
      .where('detail.user_id = :userId', { userId })
      .andWhere('detail.user_id != expense.user_id')
      .groupBy('creditor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

  private getUserExpensesBuilder = (
    userId: string,
  ): Promise<{ amount: string } | undefined> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId })
      .andWhere('detail.user_id = expense.user_id')
      .getRawOne<{ amount: string }>();

  private getDayExpensesBuilder = (userId: string): Promise<DayExpenseDto[]> =>
    this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.details', 'detail', 'detail.user_id = :userId', {
        userId,
      })
      .select([
        'DATE(expense.expensedAt) AS "date"',
        `SUM(
          CASE WHEN expense.user_id = :userId THEN expense.amount ELSE 0 END
        ) AS "expensesAmount"`,
        'SUM(COALESCE(detail.amount, 0)) AS "debtsAmount"',
      ])
      .where('expense.user_id = :userId', { userId })
      .orWhere('detail.user_id = :userId', { userId })
      .groupBy('DATE(expense.expensedAt)')
      .orderBy('DATE(expense.expensedAt)', 'ASC')
      .getRawMany<DayExpenseDto>();

  private getChartData = (dayExpenses: DayExpenseDto[]): ChartDto => ({
    labels: dayExpenses.map(({ date }) => formatDate(new Date(date), 'dd MMM')),
    expensesData: dayExpenses.map(({ expensesAmount }) =>
      Number(expensesAmount),
    ),
    debtsData: dayExpenses.map(({ debtsAmount }) => Number(debtsAmount)),
  });
}
