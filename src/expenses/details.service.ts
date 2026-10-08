import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseDetail } from '@/expenses/entities/detail.entity';
import { Pageable } from '@/common/pageable';
import { QueryDto } from '@/common/dto/query.dto';
import { ExpenseSummaryDetailDto } from '@/expenses/dto/expenses-summary.dto';
import { DetailsSumQueryDto } from '@/expenses/dto/details-query.dto';

@Injectable()
export class DetailsService extends Pageable<ExpenseDetail> {
  constructor(
    @InjectRepository(ExpenseDetail)
    private readonly repository: Repository<ExpenseDetail>,
  ) {
    super();
  }

  async findDebts(query: DetailsSumQueryDto, userId: string): Promise<string> {
    const builder = this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :debtorId', { debtorId: query.debtor })
      .andWhere('expense.user_id = :userId', { userId })
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) <= DATE(:closedAt)', {
        closedAt: query.closedAt,
      });

    const result = await builder.getRawOne<{ amount: string }>();

    return Number(result?.amount).toFixed(2);
  }

  totalDebtsBuilder(query: QueryDto) {
    return this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .getRawOne<{ amount: string }>();
  }

  debtorsBuilder(query: QueryDto) {
    return this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect('debtor.firstName', 'firstName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .groupBy('debtor.id')
      .getRawMany<ExpenseSummaryDetailDto>();
  }

  creditorsBuilder(query: QueryDto) {
    return this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect('creditor.firstName', 'firstName')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id != expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .groupBy('creditor.id')
      .getRawMany<ExpenseSummaryDetailDto>();
  }

  userExpensesBuilder(query: QueryDto) {
    return this.repository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .where('detail.user_id = :userId', { userId: query.user })
      .andWhere('detail.user_id = expense.user_id')
      .andWhere('expense.group_id = :groupId', { groupId: query.group })
      .andWhere('DATE(expense.expensed_at) >= DATE(:startDate)', {
        startDate: query.startDate,
      })
      .andWhere('DATE(expense.expensed_at) <= DATE(:endDate)', {
        endDate: query.endDate,
      })
      .getRawOne<{ amount: string }>();
  }
}
