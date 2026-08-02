import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { Payment } from '@/payments/entities/payment.entity';
import { User } from '@/users/entities/user.entity';
import { MailTemplate } from '@/mailer/interfaces';
import { PaymentEvent } from '@/events/payments/payment.event';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { PAY_DESCRIPTION } from '@/common/constants';
import { SettlementsService } from '@/settlements/settlements.service';
import { ExpensesService } from '@/expenses/expenses.service';
import { ReportsService } from '@/reports/reports.service';

@Injectable()
export class PaymentsService extends Pageable<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
    private readonly settlementsService: SettlementsService,
    private readonly expensesService: ExpensesService,
    private readonly reportsService: ReportsService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    const { group, payer, remaining } = createPaymentDto;

    const paymentExpenses = await this.settlementsService.create(
      group,
      payer,
      user.id,
    );

    if (remaining > 0)
      await this.expensesService.create(
        {
          description: 'Saldo pendiente de pago',
          amount: Number(remaining.toFixed(2)),
          group,
          splitted: false,
          expensedAt: new Date().toISOString(),
          details: [{ user: payer, amount: Number(remaining.toFixed(2)) }],
        },
        user,
      );

    const payment = this.repository.create({
      ...createPaymentDto,
      amount: createPaymentDto.amount.toString(),
      debt: createPaymentDto.debt.toString(),
      remaining: remaining.toString(),
      expenses: paymentExpenses,
      group: { id: group },
      payer: { id: payer },
      user: { id: user.id },
    });

    const saved = await this.repository.save(payment);
    const paymentCreated = await this.findOne(saved.id);

    this.emitEvent(
      'payment.created',
      paymentCreated,
      'Nuevo pago registrado',
      'payment-created',
    );

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
      .addSelect(['payer.firstName', 'payer.lastName']);

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

  async findOne(id: string): Promise<Payment> {
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
        group: { id: true, name: true },
        user: { id: true, firstName: true, lastName: true },
        payer: { id: true, firstName: true, lastName: true, email: true },
      },
      where: { id },
      relations: { group: true, user: true, payer: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return payment;
  }

  async findReport(id: string): Promise<Buffer<ArrayBufferLike>> {
    const payment = await this.findOne(id);

    const pdf = this.reportsService.createPaymentPdf(payment);

    return await pdf.getBuffer();
  }

  async remove(id: string, user: User): Promise<UpdateResult> {
    const payment = await this.findOne(id);

    if (!user.isAdmin && payment.user.id !== user.id)
      throw new ForbiddenException('Payment invalid');

    await this.expensesService.create(
      {
        description: 'Reversión de pago',
        amount: Number(payment.amount),
        group: payment.group.id,
        splitted: false,
        expensedAt: new Date().toISOString(),
        details: [{ user: payment.payer.id, amount: Number(payment.amount) }],
      },
      user,
    );

    return await this.repository.softDelete(id);
  }

  private emitEvent(
    event: string,
    payment: Payment,
    subject: string,
    template: MailTemplate,
  ) {
    this.eventEmitter.emit(
      event,
      new PaymentEvent(
        { subject, template },
        {
          id: payment.id,
          payer: {
            firstName: payment.payer.firstName,
            email: payment.payer.email,
          },
          description: payment.description,
          group: { name: payment.group.name },
          creditor: { firstName: payment.user.firstName },
          method: PAY_DESCRIPTION[payment.method],
          createdAt: payment.createdAt,
          debt: payment.debt,
          amount: payment.amount,
          remaining: payment.remaining,
        },
      ),
    );
  }
}
