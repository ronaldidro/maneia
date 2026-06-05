import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';
import {
  ExpenseSummaryDetailDto,
  ExpenseSummaryDto,
} from '@/summary/dto/summary.dto';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,

    @InjectRepository(ExpenseDetail)
    private readonly detailRepository: Repository<ExpenseDetail>,
  ) {}

  async findAll(user: User): Promise<ExpenseSummaryDto> {
    const totalExpensesBuilder = this.repository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount),0)', 'amount')
      .where('expense.user_id = :id', { id: user.id })
      .getRawOne<{ amount: string }>();

    const totalDebtsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('COALESCE(SUM(detail.amount),0)', 'amount')
      .where('detail.user_id = :id', { id: user.id })
      .getRawOne<{ amount: string }>();

    const debtorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.user', 'debtor')
      .addSelect('debtor.firstName', 'firstName')
      .addSelect('debtor.lastName', 'lastName')
      .addSelect("CONCAT(debtor.first_name, ' ', debtor.last_name)", 'fullName')
      .leftJoin('detail.expense', 'expense')
      .where('expense.user_id = :id', { id: user.id })
      .groupBy('debtor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

    const creditorsBuilder = this.detailRepository
      .createQueryBuilder('detail')
      .select('SUM(detail.amount)', 'amount')
      .leftJoin('detail.expense', 'expense')
      .leftJoin('expense.user', 'creditor')
      .addSelect('creditor.firstName', 'firstName')
      .addSelect('creditor.lastName', 'lastName')
      .addSelect(
        "CONCAT(creditor.first_name, ' ', creditor.last_name)",
        'fullName',
      )
      .where('detail.user_id = :id', { id: user.id })
      .groupBy('creditor.id')
      .getRawMany<ExpenseSummaryDetailDto>();

    const [totalExpenses, totalDebts, debtors, creditors] = await Promise.all([
      totalExpensesBuilder,
      totalDebtsBuilder,
      debtorsBuilder,
      creditorsBuilder,
    ]);

    const totalDebt = debtors.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    const totalPaid = Number(totalExpenses?.amount);
    const userExpenses = Number((totalPaid - totalDebt).toFixed(2));

    return {
      user: user.firstName,
      expenses: totalPaid,
      amount: userExpenses,
      debts: Number(totalDebts?.amount),
      debtors,
      creditors,
    };
  }
}
