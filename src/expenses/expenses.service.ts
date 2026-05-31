import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '@/expenses/entities/expense.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ExpenseDetail } from '@/expenses/entities/expense-detail.entity';
import { User } from '@/users/entities/user.entity';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { DetailsQueryDto } from '@/expenses/dto/details-query.dto';
import { BasePaginate, PaginatedResponse } from '@/base/base.paginate';
import {
  ExpenseSummaryDetailDto,
  ExpenseSummaryDto,
} from '@/expenses/dto/expense-summary.dto';

@Injectable()
export class ExpensesService extends BasePaginate<Expense | ExpenseDetail> {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {
    super();
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    const details = this.detailRepository.create(
      createExpenseDto.details.map((detail) => ({
        amount: detail.amount.toString(),
        user: { id: detail.user },
      })),
    );

    const expense = this.repository.create({
      ...createExpenseDto,
      amount: createExpenseDto.amount.toString(),
      user: { id: userId },
      group: { id: createExpenseDto.group },
      details,
    });

    return await this.repository.save(expense);
  }

  async findAll(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense | ExpenseDetail>> {
    const { search, startDate, endDate } = query;

    const builder = this.repository
      .createQueryBuilder('expense')
      .select([
        'expense.id',
        'expense.description',
        'expense.amount',
        'expense.expensedAt',
      ])
      .leftJoin('expense.user', 'payer')
      .addSelect(['payer.firstName', 'payer.lastName'])
      .leftJoin('expense.details', 'detail')
      .addSelect(['detail.id'])
      .leftJoin('detail.user', 'debtor')
      .addSelect(['debtor.firstName', 'debtor.lastName']);

    if (!user.isAdmin) builder.where('payer.id = :userId', { userId: user.id });

    if (search)
      builder.andWhere('expense.description ILIKE :search', {
        search: `%${search}%`,
      });

    if (startDate)
      builder.andWhere('expense.expensedAt >= :startDate', { startDate });

    if (endDate)
      builder.andWhere('expense.expensedAt <= :endDate', { endDate });

    builder.orderBy('expense.expensedAt', 'DESC');

    return await this.paginate(builder, query);
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.repository.findOne({
      select: {
        id: true,
        description: true,
        amount: true,
        splitted: true,
        expensedAt: true,
        group: { name: true },
        user: { id: true, firstName: true, lastName: true },
        details: {
          id: true,
          amount: true,
          user: { firstName: true, lastName: true },
        },
      },
      where: { id },
      relations: { details: { user: true }, group: true, user: true },
    });

    if (!expense) throw new NotFoundException('Expense not found');

    return expense;
  }

  async findDetails(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense | ExpenseDetail>> {
    const { search, startDate, endDate } = query;

    const builder = this.detailRepository
      .createQueryBuilder('detail')
      .select(['detail.id', 'detail.amount'])
      .leftJoin('detail.expense', 'expense')
      .addSelect(['expense.id', 'expense.description', 'expense.expensedAt'])
      .leftJoin('expense.user', 'payer')
      .addSelect(['payer.firstName', 'payer.lastName']);

    if (!user.isAdmin)
      builder.where('detail.user_id = :userId', { userId: user.id });

    if (search)
      builder.andWhere('expense.description ILIKE :search', {
        search: `%${search}%`,
      });

    if (startDate)
      builder.andWhere('expense.expensedAt >= :startDate', { startDate });

    if (endDate)
      builder.andWhere('expense.expensedAt <= :endDate', { endDate });

    builder.orderBy('expense.expensedAt', 'DESC');

    return await this.paginate(builder, query);
  }

  async findDetailsSum(
    query: DetailsQueryDto,
    userId: string,
  ): Promise<string> {
    const builder = this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :debtorId', { debtorId: query.debtor })
      .andWhere('expense.user_id = :userId', { userId })
      .andWhere('expense.group_id = :groupId', { groupId: query.group });

    const result = await builder.getRawOne<{ amount: string }>();

    return Number(result?.amount).toFixed(2);
  }

  async findSummary(user: User): Promise<ExpenseSummaryDto> {
    const totalExpensesBuilder = this.repository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount),0)', 'amount')
      .where('expense.user_id = :id', { id: user.id })
      .getRawOne<{ amount: string }>();

    const totalDebtsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .where('detail.user_id = :id', { id: user.id })
      .getRawOne<{ amount: string }>();

    const debtorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect("CONCAT(debtor.first_name, ' ', debtor.last_name)", 'fullName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :id', { id: user.id })
      .groupBy('debtor.id')
      .getRawMany<{
        id: string;
        fullName: string;
        amount: string;
      }>();

    const creditorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect(
        "CONCAT(creditor.first_name, ' ', creditor.last_name)",
        'fullName',
      )
      .where('detail.user_id = :id', { id: user.id })
      .groupBy('creditor.id')
      .getRawMany<{
        id: string;
        fullName: string;
        amount: string;
      }>();

    const [totalExpenses, totalDebts, debtors, creditors] = await Promise.all([
      totalExpensesBuilder,
      totalDebtsBuilder,
      debtorsBuilder,
      creditorsBuilder,
    ]);

    const debtorMapper = this.mapSummaryDetails(debtors);
    const creditorMapper = this.mapSummaryDetails(creditors);

    const totalDebt = debtorMapper.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = Number(totalExpenses?.amount);
    const userExpenses = Number((totalPaid - totalDebt).toFixed(2));

    return {
      user: user.fullName,
      expenses: totalPaid,
      amount: userExpenses,
      debts: Number(totalDebts?.amount),
      debtors: debtorMapper,
      creditors: creditorMapper,
    };
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    const expense = await this.findOne(id);

    if (!user.isAdmin && expense.user.id !== user.id)
      throw new ForbiddenException('Expense invalid');

    return await this.repository.delete(id);
  }

  private mapSummaryDetails(
    rows: {
      id: string;
      fullName: string;
      amount: string;
    }[],
  ): ExpenseSummaryDetailDto[] {
    return rows.map((item) => ({
      id: item.id,
      fullName: item.fullName,
      amount: Number(item.amount),
    }));
  }
}
