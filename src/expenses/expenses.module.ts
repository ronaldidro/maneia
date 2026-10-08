import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from '@/expenses/expenses.service';
import { DetailsService } from '@/expenses/details.service';
import { SummariesService } from '@/expenses/summaries.service';
import { ExpensesController } from '@/expenses/expenses.controller';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseDetail } from '@/expenses/entities/detail.entity';
import { ReportsModule } from '@/reports/reports.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseDetail]),
    ReportsModule,
    MembershipsModule,
    AuthModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, SummariesService, DetailsService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
