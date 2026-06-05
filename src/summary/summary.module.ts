import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ExpenseDetail } from '@/expenses/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { SummaryService } from '@/summary/summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseDetail])],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
