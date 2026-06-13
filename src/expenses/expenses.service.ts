import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '@/expenses/entities/expense.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { User } from '@/users/entities/user.entity';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { QueryDto } from '@/common/dto/query.dto';

@Injectable()
export class ExpensesService extends Pageable<Expense> {
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

  async findAll(query: QueryDto, user: User): Promise<Expense[]> {
    const builder = this.buildQuery(query, user);
    return await builder.getMany();
  }

  async findAllPaginated(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense>> {
    const builder = this.buildQuery(query, user);
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

  async remove(id: string, user: User): Promise<DeleteResult> {
    const expense = await this.findOne(id);

    if (!user.isAdmin && expense.user.id !== user.id)
      throw new ForbiddenException('Expense invalid');

    return await this.repository.delete(id);
  }

  private buildQuery(query: QueryDto, user: User): SelectQueryBuilder<Expense> {
    const { search, group, user: debtor, startDate, endDate } = query;

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
      .addSelect(['payer.firstName', 'payer.lastName'])
      .leftJoin('expense.details', 'detail')
      .addSelect(['detail.id', 'detail.amount'])
      .leftJoin('detail.user', 'debtor')
      .addSelect(['debtor.firstName', 'debtor.lastName'])
      .leftJoin('expense.group', 'group')
      .addSelect(['group.name']);

    if (!user.isAdmin) builder.where('payer.id = :userId', { userId: user.id });

    if (search)
      builder.andWhere('expense.description ILIKE :search', {
        search: `%${search.trim()}%`,
      });

    if (group)
      builder.andWhere('expense.group_id = :groupId', { groupId: group });

    if (debtor)
      builder.andWhere('detail.user_id = :debtorId', { debtorId: debtor });

    if (startDate)
      builder.andWhere('expense.expensedAt >= :startDate', { startDate });

    if (endDate)
      builder.andWhere('expense.expensedAt <= :endDate', { endDate });

    return builder.orderBy('expense.expensedAt', 'DESC');
  }
}
