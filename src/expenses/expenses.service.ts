import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from '@expenses/dto/create-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '@expenses/entities/expense.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ExpenseDetail } from '@expenses/entities/expense-detail.entity';
import { User } from '@users/entities/user.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {}

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
      description: createExpenseDto.description,
      amount: createExpenseDto.amount.toString(),
      user: { id: userId },
      group: { id: createExpenseDto.group },
      details,
    });

    return await this.repository.save(expense);
  }

  async findAll(user: User): Promise<Expense[]> {
    return await this.repository.find({
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        details: { id: true, user: { firstName: true, lastName: true } },
      },
      where: this.userFilter(user),
      relations: { details: { user: true } },
    });
  }

  async findOne(id: string, user: User): Promise<Expense> {
    const expense = await this.repository.findOne({
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        details: {
          id: true,
          amount: true,
          user: { firstName: true, lastName: true },
        },
      },
      where: { id, ...this.userFilter(user) },
      relations: { details: { user: true } },
    });

    if (!expense) throw new NotFoundException('Expense not found');

    return expense;
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    await this.findOne(id, user);

    return await this.repository.delete(id);
  }

  private userFilter(user: User) {
    return user.isAdmin ? {} : { user: { id: user.id } };
  }
}
