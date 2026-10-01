import { Module } from '@nestjs/common';
import { SummariesService } from '@/expenses/summaries.service';
import { ExpensesService } from '@/expenses/expenses.service';
import { ExpensesController } from '@/expenses/expenses.controller';
import { Expense } from '@/expenses/entities/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseDetail]), ReportsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, SummariesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
