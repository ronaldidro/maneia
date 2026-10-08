import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Brackets,
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { Payment } from '@/payments/entities/payment.entity';
import { PaymentExpense } from '@/payments/interfaces';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import { PaymentEvent } from '@/events/payments/payment.event';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { PAY_DESCRIPTION } from '@/common/constants';
import { formatDate } from '@/common/helpers';
import { ReportsService } from '@/reports/reports.service';
import { AuthService } from '@/auth/auth.service';
import { Action } from '@/common/enum/action.enum';

@Injectable()
export class PaymentsService extends Pageable<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,

    private readonly reportsService: ReportsService,
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    const { group, payer, remaining, closedAt } = createPaymentDto;

    const saved = await this.dataSource.transaction(async (manager) => {
      const paymentExpenses = await this.settleExpenses(
        manager,
        group,
        payer,
        user,
        closedAt,
      );

      if (remaining > 0)
        await this.saveExpense(manager, {
          description: 'Saldo pendiente de pago',
          amount: remaining.toFixed(2),
          group: { id: group },
          user: { id: user.id },
          splitted: false,
          expensedAt: new Date(),
          details: [{ user: { id: payer }, amount: remaining.toFixed(2) }],
        });

      return await manager.save(Payment, {
        ...createPaymentDto,
        amount: createPaymentDto.amount.toString(),
        debt: createPaymentDto.debt.toString(),
        remaining: remaining.toString(),
        expenses: paymentExpenses,
        group: { id: group },
        payer: { id: payer },
        user: { id: user.id },
      });
    });

    const paymentCreated = await this.findOne(saved.id);

    this.emitEvent('payment.created', paymentCreated);

    return paymentCreated;
  }

  async findAll(
    query: PaymentsQueryDto,
    user: User,
  ): Promise<PaginatedResponse<Payment>> {
    const { search, startDate, endDate } = query;

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
      .addSelect(['payer.firstName', 'payer.lastName'])
      .leftJoin('payment.group', 'group')
      .addSelect(['group.name']);

    if (!user.isAdmin)
      builder.where(
        new Brackets((qb) =>
          qb
            .where('payment.user_id = :userId', { userId: user.id })
            .orWhere('payment.payer_id = :userId', { userId: user.id }),
        ),
      );

    if (search)
      builder.andWhere('payment.description ILIKE :search', {
        search: `%${search.trim()}%`,
      });

    if (startDate)
      builder.andWhere('payment.createdAt >= :startDate', { startDate });

    if (endDate) builder.andWhere('payment.createdAt <= :endDate', { endDate });

    builder.orderBy('payment.createdAt', 'DESC');

    return await this.paginate(builder, query);
  }

  async findOne(id: string, withDeleted: boolean = false): Promise<Payment> {
    const payment = await this.repository.findOne({
      select: {
        id: true,
        description: true,
        debt: true,
        amount: true,
        remaining: true,
        method: true,
        expenses: true,
        createdAt: true,
        closedAt: true,
        group: { id: true, name: true },
        user: { id: true, firstName: true, lastName: true },
        payer: { id: true, firstName: true, lastName: true, email: true },
      },
      where: { id },
      withDeleted,
      relations: { group: true, user: true, payer: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async findReport(
    id: string,
    withDeleted: boolean = false,
  ): Promise<Buffer<ArrayBufferLike>> {
    const payment = await this.findOne(id, withDeleted);

    const pdf = this.reportsService.createPaymentPdf(payment);

    return await pdf.getBuffer();
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    const payment = await this.findOne(id);

    this.authService.checkAbility(user, Action.Delete, payment);

    const result = await this.dataSource.transaction(async (manager) => {
      await this.saveExpense(manager, {
        description: 'Reversión de pago',
        amount: payment.amount,
        group: payment.group,
        user: { id: user.id },
        splitted: false,
        expensedAt: new Date(),
        details: [{ user: payment.payer, amount: payment.amount }],
      });

      return await manager.softDelete(Payment, id);
    });

    const paymentDeleted = { ...payment, deletedAt: new Date() };

    this.emitEvent('payment.deleted', paymentDeleted);

    return result;
  }

  private async settleExpenses(
    manager: EntityManager,
    group: string,
    payer: string,
    user: User,
    closedAt: string,
  ): Promise<PaymentExpense[]> {
    const detailsToSettle = await manager
      .createQueryBuilder(ExpenseDetail, 'detail')
      .select(['detail.id', 'detail.amount'])
      .leftJoin('detail.expense', 'expense')
      .addSelect([
        'expense.id',
        'expense.description',
        'expense.amount',
        'expense.splitted',
        'expense.expensedAt',
      ])
      .leftJoin('detail.user', 'payer')
      .addSelect(['payer.id', 'payer.firstName', 'payer.lastName'])
      .leftJoin('expense.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .leftJoin('expense.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .leftJoin('expense.details', 'details')
      .addSelect('details.id')
      .where('detail.user_id = :payerId', { payerId: payer })
      .andWhere('expense.user_id = :userId', { userId: user.id })
      .andWhere('expense.group_id = :groupId', { groupId: group })
      .andWhere('DATE(expense.expensed_at) <= DATE(:closedAt)', { closedAt })
      .orderBy('expense.expensed_at', 'ASC')
      .getMany();

    const detailsToRemove: ExpenseDetail[] = [];
    const expensesToRemove: Expense[] = [];
    const paymentExpenses: PaymentExpense[] = [];

    for (const detail of detailsToSettle) {
      const expense = detail.expense;

      if (expense.details.length === 1 && !expense.splitted) {
        expensesToRemove.push(expense);
      } else {
        detailsToRemove.push(detail);
      }

      paymentExpenses.push(this.mapToPaymentExpense(expense, detail));
    }

    await Promise.all([
      detailsToRemove.length
        ? manager.remove(detailsToRemove)
        : Promise.resolve(),
      expensesToRemove.length
        ? manager.remove(expensesToRemove)
        : Promise.resolve(),
    ]);

    return paymentExpenses;
  }

  private mapToPaymentExpense(
    expense: Expense,
    detail: ExpenseDetail,
  ): PaymentExpense {
    return {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      splitted: expense.splitted,
      expensedAt: formatDate(expense.expensedAt, 'dd MMM yy'),
      group: {
        id: expense.group.id,
        name: expense.group.name,
      },
      owner: {
        id: expense.user.id,
        firstName: expense.user.firstName,
        lastName: expense.user.lastName,
      },
      details: [
        {
          debtor: {
            id: detail.user.id,
            firstName: detail.user.firstName,
            lastName: detail.user.lastName,
          },
          amount: detail.amount,
        },
      ],
    };
  }

  private async saveExpense(
    manager: EntityManager,
    expense: DeepPartial<Expense>,
  ): Promise<void> {
    const created = manager.create(Expense, expense);
    await manager.save(Expense, created);
  }

  private emitEvent(event: string, payment: Payment) {
    this.eventEmitter.emit(
      event,
      new PaymentEvent({
        id: payment.id,
        payer: {
          id: payment.payer.id,
          firstName: payment.payer.firstName,
          email: payment.payer.email,
        },
        description: payment.description,
        group: { name: payment.group.name },
        creditor: { firstName: payment.user.firstName },
        method: PAY_DESCRIPTION[payment.method],
        createdAt: payment.createdAt,
        deletedAt: payment.deletedAt,
        debt: payment.debt,
        amount: payment.amount,
        remaining: payment.remaining,
      }),
    );
  }
}
