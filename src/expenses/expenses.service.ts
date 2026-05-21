import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from '@/expenses/dto/create-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '@/expenses/entities/expense.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ExpenseDetail } from '@/expenses/entities/expense-detail.entity';
import { User } from '@/users/entities/user.entity';
import { ExpensesQueryDto } from '@/expenses/dto/expenses-query.dto';
import { BasePaginate, PaginatedResponse } from '@/base/base.paginate';

@Injectable()
export class ExpensesService extends BasePaginate<Expense> {
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
      user: { id: userId },
      group: { id: createExpenseDto.group },
      expensedAt: createExpenseDto.expensedAt,
      description: createExpenseDto.description,
      amount: createExpenseDto.amount.toString(),
      details,
    });

    return await this.repository.save(expense);
  }

  async findAll(
    query: ExpensesQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Expense>> {
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
      .addSelect(['payer.firstName', 'payer.lastName']);

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

  async findOne(id: string, user: User): Promise<Expense> {
    const where = user.isAdmin ? { id } : { id, user: { id: user.id } };

    const expense = await this.repository.findOne({
      select: {
        id: true,
        description: true,
        amount: true,
        expensedAt: true,
        group: { name: true },
        details: {
          id: true,
          amount: true,
          user: { firstName: true, lastName: true },
        },
      },
      where,
      relations: { details: { user: true }, group: true },
    });

    if (!expense) throw new NotFoundException('Expense not found');

    return expense;
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    await this.findOne(id, user);

    return await this.repository.delete(id);
  }
}
