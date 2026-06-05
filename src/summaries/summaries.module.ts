import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { SummariesService } from '@/summaries/summaries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseDetail])],
  providers: [SummariesService],
  exports: [SummariesService],
})
export class SummariesModule {}
