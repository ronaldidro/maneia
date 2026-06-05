import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  LessThanOrEqual,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { Payment } from '@/payments/entities/payment.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { BasePaginate, PaginatedResponse } from '@/base/base.paginate';

@Injectable()
export class PaymentsService extends BasePaginate<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,

    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    return await this.dataSource.transaction(async (manager) => {
      await this.settleDebt(manager, createPaymentDto, user.id);

      const payment = this.repository.create({
        ...createPaymentDto,
        amount: createPaymentDto.amount.toString(),
        debt: createPaymentDto.debt.toString(),
        group: { id: createPaymentDto.group },
        payer: { id: createPaymentDto.payer },
        user: { id: user.id },
      });

      return await this.repository.save(payment);
    });
  }

  async findAll(
    query: PaymentsQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Payment>> {
    const builder = this.repository
      .createQueryBuilder('payment')
      .select([
        'payment.id',
        'payment.description',
        'payment.amount',
        'payment.createdAt',
      ])
      .leftJoin('payment.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .leftJoin('payment.payer', 'payer')
      .addSelect(['payer.firstName', 'payer.lastName']);

    if (!user.isAdmin)
      builder
        .where('payment.user_id = :userId', { userId: user.id })
        .orWhere('payment.payer_id = :userId', { userId: user.id });

    builder.orderBy('payment.createdAt', 'DESC');

    return await this.paginate(builder, query);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.repository.findOne({
      select: {
        id: true,
        description: true,
        debt: true,
        amount: true,
        method: true,
        createdAt: true,
        group: { id: true, name: true },
        user: { id: true, firstName: true, lastName: true },
        payer: { id: true, firstName: true, lastName: true },
      },
      where: { id },
      relations: { group: true, user: true, payer: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async remove(id: string, user: User): Promise<UpdateResult> {
    const payment = await this.findOne(id);

    if (!user.isAdmin && payment.user.id !== user.id)
      throw new ForbiddenException('Payment invalid');

    return await this.dataSource.transaction(async (manager) => {
      const expenseRepository = manager.getRepository(Expense);
      const detailRepository = manager.getRepository(ExpenseDetail);

      const expense = this.createRegulatoryExpense(
        expenseRepository,
        detailRepository,
        {
          description: 'Reversión de pago',
          amount: payment.amount,
          userId: payment.user.id,
          payerId: payment.payer.id,
          groupId: payment.group.id,
        },
      );

      await expenseRepository.save(expense);

      return await this.repository.softDelete(id);
    });
  }

  private async settleDebt(
    manager: EntityManager,
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<void> {
    const expenseRepository = manager.getRepository(Expense);
    const detailRepository = manager.getRepository(ExpenseDetail);

    const expensesToUpdate: Expense[] = [];
    const detailsToRemove: ExpenseDetail[] = [];
    const expensesToRemove: Expense[] = [];

    const expenses = await expenseRepository.find({
      where: {
        user: { id: userId },
        group: { id: dto.group },
        expensedAt: LessThanOrEqual(new Date()),
      },
      relations: { details: { user: true } },
      order: { expensedAt: 'ASC' },
    });

    for (const expense of expenses) {
      const detail = expense.details.find(
        (detail) => detail.user.id === dto.payer,
      );

      if (!detail) continue;

      if (expense.details.length === 1 && !expense.splitted) {
        expensesToRemove.push(expense);
        continue;
      }

      expense.amount = (Number(expense.amount) - Number(detail.amount)).toFixed(
        2,
      );

      expensesToUpdate.push(expense);
      detailsToRemove.push(detail);
    }

    await Promise.all([
      expenseRepository.save(expensesToUpdate),
      detailRepository.remove(detailsToRemove),
      expenseRepository.remove(expensesToRemove),
    ]);

    const remaining = dto.debt - dto.amount;

    if (remaining > 0) {
      const expense = this.createRegulatoryExpense(
        expenseRepository,
        detailRepository,
        {
          description: 'Saldo pendiente de pago',
          amount: remaining.toFixed(2),
          userId,
          payerId: dto.payer,
          groupId: dto.group,
        },
      );

      await expenseRepository.save(expense);
    }
  }

  private createRegulatoryExpense(
    expenseRepository: Repository<Expense>,
    detailRepository: Repository<ExpenseDetail>,
    params: {
      description: string;
      amount: string;
      userId: string;
      payerId: string;
      groupId: string;
    },
  ): Expense {
    return expenseRepository.create({
      description: params.description,
      amount: params.amount,
      expensedAt: new Date(),
      splitted: false,
      user: { id: params.userId },
      group: { id: params.groupId },
      details: [
        detailRepository.create({
          amount: params.amount,
          user: { id: params.payerId },
        }),
      ],
    });
  }
}
