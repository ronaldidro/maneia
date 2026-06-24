import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Pageable, PaginatedResponse } from '@/common/pageable';
import { QueryDto } from '@/common/dto/query.dto';
import { User } from '@/users/entities/user.entity';
import { DetailsSumQueryDto } from '@/details/dto/details-sum-query.dto';
import { DetailsQueryDto } from '@/details/dto/details-query.dto';
import { ReportsService } from '@/reports/reports.service';

@Injectable()
export class DetailsService extends Pageable<ExpenseDetail> {
  constructor(
    @InjectRepository(ExpenseDetail)
    private readonly repository: Repository<ExpenseDetail>,
    private readonly reportsService: ReportsService,
  ) {
    super();
  }

  async findAll(
    query: DetailsQueryDto,
    user: User,
  ): Promise<PaginatedResponse<ExpenseDetail>> {
    const builder = this.buildQuery(query, user);
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

  async findReport(
    query: QueryDto,
    user: User,
  ): Promise<Buffer<ArrayBufferLike>> {
    const builder = this.buildQuery(query, user);

    const details = await builder.getMany();

    if (!details.length) throw new NotFoundException('Details not found');

    const pdf = this.reportsService.createDetailsPdf(details, query);

    return await pdf.getBuffer();
  }

  private buildQuery(
    query: QueryDto,
    user: User,
  ): SelectQueryBuilder<ExpenseDetail> {
    const { search, group, user: payer, startDate, endDate } = query;

    const builder = this.repository
      .createQueryBuilder('detail')
      .select(['detail.id', 'detail.amount'])
      .leftJoin('detail.expense', 'expense')
      .addSelect(['expense.id', 'expense.description', 'expense.expensedAt'])
      .leftJoin('expense.user', 'payer')
      .addSelect(['payer.firstName', 'payer.lastName'])
      .leftJoin('expense.group', 'group')
      .addSelect(['group.name'])
      .where('detail.user_id != expense.user_id');

    if (!user.isAdmin)
      builder.andWhere('detail.user_id = :userId', { userId: user.id });

    if (search)
      builder.andWhere('expense.description ILIKE :search', {
        search: `%${search.trim()}%`,
      });

    if (group)
      builder.andWhere('expense.group_id = :groupId', { groupId: group });

    if (payer)
      builder.andWhere('expense.user_id = :payerId', { payerId: payer });

    if (startDate)
      builder.andWhere('expense.expensedAt >= :startDate', { startDate });

    if (endDate)
      builder.andWhere('expense.expensedAt <= :endDate', { endDate });

    return builder.orderBy('expense.expensedAt', 'DESC');
  }
}
