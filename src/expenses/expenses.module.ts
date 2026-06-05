import { Module } from '@nestjs/common';
import { ExpensesService } from '@/expenses/expenses.service';
import { ExpensesController } from '@/expenses/expenses.controller';
import { Expense } from '@/expenses/entities/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { SummaryModule } from '@/summary/summary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseDetail]), SummaryModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
