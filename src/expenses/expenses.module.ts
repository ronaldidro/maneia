import { Module } from '@nestjs/common';
import { ExpensesService } from '@/expenses/expenses.service';
import { ExpensesController } from '@/expenses/expenses.controller';
import { Expense } from '@/expenses/entities/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { SummariesModule } from '@/summaries/summaries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseDetail]),
    SummariesModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
