import { Module } from '@nestjs/common';
import { ExpensesService } from '@expenses/expenses.service';
import { ExpensesController } from '@expenses/expenses.controller';
import { Expense } from '@expenses/entities/expense.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseDetail } from '@expenses/entities/expense-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseDetail])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
