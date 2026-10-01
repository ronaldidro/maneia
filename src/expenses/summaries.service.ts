import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@/common/dto/query.dto';
import { formatDate } from '@/common/helpers';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import {
  ChartDto,
  DayExpenseDto,
  ExpenseSummaryDetailDto,
  ExpenseSummaryDto,
} from '@/expenses/dto/summary.dto';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {}

  async findAll(query: QueryDto, user: User): Promise<ExpenseSummaryDto> {
    const summaryQuery = { ...query, user: user.id };

    const totalExpensesBuilder = this.getTotalExpensesBuilder(summaryQuery);
    const totalDebtsBuilder = this.getTotalDebtsBuilder(summaryQuery);
    const debtorsBuilder = this.getDebtorsBuilder(summaryQuery);
    const creditorsBuilder = this.getCreditorsBuilder(summaryQuery);
    const userExpensesBuilder = this.getUserExpensesBuilder(summaryQuery);
    const dayExpensesBuilder = this.getDayExpensesBuilder(summaryQuery);

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
    query: QueryDto,
  ): Promise<{ amount: string } | undefined> =>
    this.expenseRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount),0)', 'amount')
      .where('expense.user_id = :userId', { userId: query.user })
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .getRawOne<{ amount: string }>();

  private getTotalDebtsBuilder = (
    query: QueryDto,
  ): Promise<{ amount: string } | undefined> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .getRawOne<{ amount: string }>();

  private getDebtorsBuilder = (
    query: QueryDto,
  ): Promise<ExpenseSummaryDetailDto[]> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect('debtor.firstName', 'firstName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .groupBy('debtor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

  private getCreditorsBuilder = (
    query: QueryDto,
  ): Promise<ExpenseSummaryDetailDto[]> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect('creditor.firstName', 'firstName')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .groupBy('creditor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

  private getUserExpensesBuilder = (
    query: QueryDto,
  ): Promise<{ amount: string } | undefined> =>
    this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id = expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .getRawOne<{ amount: string }>();

  private getDayExpensesBuilder = (query: QueryDto): Promise<DayExpenseDto[]> =>
    this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.details', 'detail', 'detail.user_id = :userId', {
        userId: query.user,
      })
      .select([
        'DATE(expense.expensedAt) AS "date"',
        `SUM(
          CASE WHEN expense.user_id = :userId THEN expense.amount ELSE 0 END
        ) AS "expensesAmount"`,
        'SUM(COALESCE(detail.amount, 0)) AS "debtsAmount"',
      ])
      .where('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensedAt) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensedAt) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where('expense.user_id = :userId', { userId: query.user })
            .orWhere('detail.user_id = :userId', { userId: query.user }),
        ),
      )
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
