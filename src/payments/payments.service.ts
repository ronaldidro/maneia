import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { CreatePaymentDto } from '@/payments/dto/create-payment.dto';
import { PaymentsQueryDto } from '@/payments/dto/payments-query.dto';
import { Payment } from '@/payments/entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Pageable, PaginatedResponse } from '@/common/pageable';

@Injectable()
export class PaymentsService extends Pageable<Payment> {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {
    super();
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    const payment = this.repository.create({
      ...createPaymentDto,
      amount: createPaymentDto.amount.toString(),
      debt: createPaymentDto.debt.toString(),
      group: { id: createPaymentDto.group },
      payer: { id: createPaymentDto.payer },
      user: { id: user.id },
    });

    return await this.repository.save(payment);
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
        search: `%${search}%`,
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

  async remove(id: string): Promise<UpdateResult> {
    return await this.repository.softDelete(id);
  }
}
