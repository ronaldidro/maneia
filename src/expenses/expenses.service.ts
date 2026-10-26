import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DeleteResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { ExpenseProcessed } from '@/expenses/dto/expenses-summary.dto';
import { QueryDto } from '@/common/dto/query.dto';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseDetail } from '@/expenses/entities/detail.entity';
import { User } from '@/users/entities/user.entity';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { DetailsService } from '@/expenses/services/details.service';
import { ReportsService } from '@/reports/reports.service';
import { AiService } from '@/ai/ai.service';
import { AuthService } from '@/auth/auth.service';
import { Action } from '@/common/enum/action.enum';

@Injectable()
export class ExpensesService extends Pageable<Expense> {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
    private readonly detailsService: DetailsService,
    private readonly reportsService: ReportsService,
    private readonly aiService: AiService,
    private readonly authService: AuthService,
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

    const details = this.detailsService.createEntities(
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

    return await this.repository.save(expense);
  }

  async transform(file: Express.Multer.File) {
    const prompt = `
      Act as an expert in accounting and receipt auditing.
      Visually analyze this image of the attached receipt or expense note.
      You must strictly identify each individual item, service, or expense description along with its respective assigned monetary amount.

      Mandatory rules:
      - If the document is handwritten, make your best effort to transcribe it logically.
      - Extract amounts as clean numerical values, without currency symbols (e.g., 15.50 instead of $15.50).
      - Return exclusively the requested JSON schema, without explanations or surrounding markdown.
      - The returned JSON structure must be in the format: [{ description: string; amount: numeric }]
    `;

    const result = await this.aiService.processFile(prompt, file);

    const items = JSON.parse(result) as ExpenseProcessed[];

    if (!items.length)
      throw new UnprocessableEntityException('File could not be processed');

    return {
      description: items
        .map((item) => item.description.toLowerCase())
        .join(', '),
      amount: items.reduce((total, item) => total + item.amount, 0),
    };
  }

  async findAll(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense>> {
    const builder = this.buildQuery(query, user);

    if (query.user) this.filterByDebtor(builder, query.user, user.id);

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

    if (query.user) this.filterByDebtor(builder, query.user, user.id);

    const expenses = await builder.getMany();

    if (!expenses.length) throw new NotFoundException('Expenses not found');

    const pdf = this.reportsService.createExpensesPdf(expenses, query);

    return await pdf.getBuffer();
  }

  async remove(id: string, user: User): Promise<Expense> {
    const expense = await this.findOne(id);

    this.authService.checkAbility(user, Action.Delete, expense);

    return await this.repository.remove(expense);
  }

  async removeAll(query: QueryDto, user: User): Promise<DeleteResult> {
    const { user: debtor } = query;

    const builder = this.buildQuery(query, user, 'destroy');

    if (debtor) this.filterByDebtor(builder, debtor, user.id);

    const expenses = await builder.getMany();

    if (!expenses.length) throw new NotFoundException('Expenses not found');

    if (debtor) {
      await this.removeUserExpenses(expenses, debtor);
      return new DeleteResult();
    }

    const ids = expenses.map((expense) => expense.id);

    return await this.repository.delete(ids); // delete -> skip subscriber
  }

  private async removeUserExpenses(
    expenses: Expense[],
    user: string,
  ): Promise<void> {
    const expensesToRemove: Expense[] = [];
    const detailsToRemove: ExpenseDetail[] = [];

    for (const expense of expenses) {
      if (expense.details.length === 1 && !expense.splitted) {
        expensesToRemove.push(expense);
      } else {
        const detail = expense.details.find(
          (detail) => detail.user.id === user,
        );

        if (detail) detailsToRemove.push(detail);
      }
    }

    const ids = expensesToRemove.map((expense) => expense.id);

    await Promise.all([
      detailsToRemove.length
        ? this.detailsService.removeEntities(detailsToRemove)
        : Promise.resolve(),
      expensesToRemove.length ? this.repository.delete(ids) : Promise.resolve(),
    ]);
  }

  private filterByDebtor(
    builder: SelectQueryBuilder<Expense>,
    debtorId: string,
    userId: string,
  ): SelectQueryBuilder<Expense> {
    if (debtorId !== userId) {
      return builder
        .andWhere('payer.id = :userId', { userId })
        .andWhere('debtor.id = :debtorId', { debtorId });
    } else {
      return builder.andWhere('debtor.id = :debtorId', { debtorId: userId });
    }
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
          new Brackets((qb) =>
            qb
              .where('payer.id = :userId', { userId: user.id })
              .orWhere((qbr: SelectQueryBuilder<Expense>) => {
                const sq = qbr
                  .subQuery()
                  .select('detail.expense_id')
                  .from('expense-details', 'detail')
                  .where('detail.user_id = :userId')
                  .getQuery();
                return `expense.id IN ${sq}`;
              }),
          ),
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
}
