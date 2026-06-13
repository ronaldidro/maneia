import { Module } from '@nestjs/common';
import { ReportsService } from '@/reports/reports.service';
import { ReportsController } from '@/reports/reports.controller';
import { ExpensesModule } from '@/expenses/expenses.module';

@Module({
  imports: [ExpensesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
