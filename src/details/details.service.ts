import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { User } from '@/users/entities/user.entity';
import { DetailsSumQueryDto } from '@/details/dto/details-sum-query.dto';
import { DetailsQueryDto } from '@/details/dto/details-query.dto';

@Injectable()
export class DetailsService extends Pageable<ExpenseDetail> {
  constructor(
    @InjectRepository(ExpenseDetail)
    private readonly repository: Repository<ExpenseDetail>,
  ) {
    super();
  }

  async findAll(
    query: DetailsQueryDto,
    user: User,
  ): Promise<PaginatedResponse<ExpenseDetail>> {
    const { search, startDate, endDate } = query;

    const builder = this.repository
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

  async findSum(query: DetailsSumQueryDto, userId: string): Promise<string> {
    const builder = this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :debtorId', { debtorId: query.debtor })
      .andWhere('expense.user_id = :userId', { userId })
      .andWhere('expense.group_id = :groupId', { groupId: query.group });

    const result = await builder.getRawOne<{ amount: string }>();

    return Number(result?.amount).toFixed(2);
  }
}
