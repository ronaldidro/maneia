import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DeleteResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ExpenseEvent } from '@/events/expenses/expense.event';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { QueryDto } from '@/common/dto/query.dto';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { User } from '@/users/entities/user.entity';
import { MailTemplate } from '@/mailer/interfaces';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { ReportsService } from '@/reports/reports.service';

@Injectable()
export class ExpensesService extends Pageable<Expense> {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,

    private readonly reportsService: ReportsService,

    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    user: User,
  ): Promise<Expense> {
    if (createExpenseDto.splitted) {
      createExpenseDto.details.push({
        user: user.id,
        amount: createExpenseDto.details[0].amount,
      });
    }

    const details = this.detailRepository.create(
      createExpenseDto.details.map((detail) => ({
        amount: detail.amount.toString(),
        user: { id: detail.user },
      })),
    );

    const expense = this.repository.create({
      ...createExpenseDto,
      amount: createExpenseDto.amount.toString(),
      user: { id: user.id },
      group: { id: createExpenseDto.group },
      details,
    });

    const saved = await this.repository.save(expense);
    const expenseCreated = await this.findOne(saved.id);

    this.emitEvent(
      'expense.created',
      expenseCreated,
      user,
      'Nuevo gasto registrado',
      'expense-created',
    );

    return expenseCreated;
  }

  async findAll(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense>> {
    const builder = this.buildQuery(query, user);

    if (query.user) this.filterByDebtor(builder, query.user);

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
        group: { id: true, name: true },
        user: { id: true, firstName: true, lastName: true },
        details: {
          id: true,
          amount: true,
          user: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      where: { id },
      relations: { details: { user: true }, group: true, user: true },
    });

    if (!expense) throw new NotFoundException('Expense not found');

    return expense;
  }

  async findReport(
    query: QueryDto,
    user: User,
  ): Promise<Buffer<ArrayBufferLike>> {
    const builder = this.buildQuery(query, user);

    if (query.user)
      builder.andWhere('detail.user_id = :debtorId', { debtorId: query.user });

    const expenses = await builder.getMany();

    if (!expenses.length) throw new NotFoundException('Expenses not found');

    const pdf = this.reportsService.createExpensesPdf(expenses, query);

    return await pdf.getBuffer();
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    const expense = await this.findOne(id);

    if (!user.isAdmin && expense.user.id !== user.id)
      throw new ForbiddenException('Expense invalid');

    const result = await this.repository.delete(id);

    this.emitEvent(
      'expense.deleted',
      { ...expense, deletedAt: new Date() },
      user,
      'Gasto eliminado',
      'expense-deleted',
    );

    return result;
  }

  async removeAll(query: QueryDto, user: User): Promise<Expense[]> {
    const { user: debtor } = query;

    const builder = this.buildQuery(query, user, 'destroy');

    if (debtor) this.filterByDebtor(builder, debtor);

    const expenses = await builder.getMany();

    if (!expenses.length) throw new NotFoundException('Expenses not found');

    if (debtor && debtor !== user.id) {
      await this.removeDebtorExpenses(expenses, debtor);
      return expenses;
    }

    return await this.repository.remove(expenses);
  }

  private async removeDebtorExpenses(
    expenses: Expense[],
    debtor: string,
  ): Promise<void> {
    const expensesToRemove: Expense[] = [];
    const detailsToRemove: ExpenseDetail[] = [];

    for (const expense of expenses) {
      if (expense.details.length === 1 && !expense.splitted) {
        expensesToRemove.push(expense);
      } else {
        const detail = expense.details.find(
          (detail) => detail.user.id === debtor,
        );

        if (detail) detailsToRemove.push(detail);
      }
    }

    await Promise.all([
      detailsToRemove.length
        ? this.detailRepository.remove(detailsToRemove)
        : Promise.resolve(),
      expensesToRemove.length
        ? this.repository.remove(expensesToRemove)
        : Promise.resolve(),
    ]);
  }

  private filterByDebtor(
    builder: SelectQueryBuilder<Expense>,
    debtor: string,
  ): SelectQueryBuilder<Expense> {
    return builder
      .andWhere((qb) => {
        const sq = qb
          .subQuery()
          .select('detail.expense_id')
          .from('expense-details', 'detail')
          .where('detail.user_id = :debtorId')
          .getQuery();
        return `expense.id IN ${sq}`;
      })
      .setParameter('debtorId', debtor);
  }

  private buildQuery(
    query: QueryDto,
    user: User,
    action: 'read' | 'destroy' = 'read',
  ): SelectQueryBuilder<Expense> {
    const { search, group, startDate, endDate } = query;

    const builder = this.repository
      .createQueryBuilder('expense')
      .select([
        'expense.id',
        'expense.description',
        'expense.amount',
        'expense.splitted',
        'expense.expensedAt',
      ])
      .leftJoin('expense.user', 'payer')
      .addSelect(['payer.id', 'payer.firstName', 'payer.lastName'])
      .leftJoin('expense.details', 'detail')
      .addSelect(['detail.id', 'detail.amount'])
      .leftJoin('detail.user', 'debtor')
      .addSelect(['debtor.id', 'debtor.firstName', 'debtor.lastName'])
      .leftJoin('expense.group', 'group')
      .addSelect(['group.name']);

    if (!user.isAdmin) {
      if (action === 'destroy') {
        builder.where('payer.id = :userId', { userId: user.id });
      } else {
        builder.where(
          new Brackets((qb) => {
            qb.where('payer.id = :userId', { userId: user.id }).orWhere(
              (qbr: SelectQueryBuilder<Expense>) => {
                const sq = qbr
                  .subQuery()
                  .select('detail.expense_id')
                  .from('expense-details', 'detail')
                  .where('detail.user_id = :userId')
                  .getQuery();
                return `expense.id IN ${sq}`;
              },
            );
          }),
        );
      }
    }

    if (search)
      builder.andWhere('expense.description ILIKE :search', {
        search: `%${search.trim()}%`,
      });

    if (group)
      builder.andWhere('expense.group_id = :groupId', { groupId: group });

    if (startDate)
      builder.andWhere('expense.expensedAt >= :startDate', { startDate });

    if (endDate)
      builder.andWhere('expense.expensedAt <= :endDate', { endDate });

    builder.orderBy('expense.expensedAt', 'DESC');

    return builder;
  }

  private emitEvent(
    event: string,
    expense: Expense,
    user: User,
    subject: string,
    template: MailTemplate,
  ) {
    this.eventEmitter.emit(
      event,
      new ExpenseEvent(
        user,
        { subject, template },
        {
          id: expense.id,
          description: expense.description,
          group: {
            id: expense.group.id,
            name: expense.group.name,
          },
          payer: { firstName: expense.user.firstName },
          createdAt: expense.expensedAt,
          deletedAt: expense.deletedAt,
          amount: expense.amount,
          details: expense.details.map(({ user, amount }) => ({
            user: { id: user.id, firstName: user.firstName, email: user.email },
            amount: amount,
          })),
        },
      ),
    );
  }
}
