import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDto } from '@/common/dto/query.dto';
import { formatDate } from '@/common/helpers';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import {
  ChartDto,
  DayExpenseDto,
  ExpenseSummaryDto,
} from '@/expenses/dto/expenses-summary.dto';
import { MembershipsService } from '@/memberships/memberships.service';
import { DetailsService } from '@/expenses/details.service';

@Injectable()
export class SummariesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly detailsService: DetailsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  async findAll(query: QueryDto, user: User): Promise<ExpenseSummaryDto> {
    const summaryQuery = { ...query, user: user.id };

    const totalExpensesBuilder = this.getTotalExpensesBuilder(summaryQuery);

    const totalDebtsBuilder =
      this.detailsService.totalDebtsBuilder(summaryQuery);

    const debtorsBuilder = this.detailsService.debtorsBuilder(summaryQuery);
    const creditorsBuilder = this.detailsService.creditorsBuilder(summaryQuery);

    const userExpensesBuilder =
      this.detailsService.userExpensesBuilder(summaryQuery);

    const dayExpensesBuilder = this.getDayExpensesBuilder(summaryQuery);

    const membershipBuilder = this.membershipsService.builder(summaryQuery);

    const [
      totalExpenses,
      totalDebts,
      debtors,
      creditors,
      userExpenses,
      dayExpenses,
      membership,
    ] = await Promise.all([
      totalExpensesBuilder,
      totalDebtsBuilder,
      debtorsBuilder,
      creditorsBuilder,
      userExpensesBuilder,
      dayExpensesBuilder,
      membershipBuilder,
    ]);

    return {
      user: user.firstName,
      expenses: Number(totalExpenses?.amount),
      amount: Number(userExpenses?.amount),
      debts: Number(totalDebts?.amount),
      debtors,
      creditors,
      chart: this.getChartData(dayExpenses),
      budget: Number(membership?.budget),
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
