import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailsService } from '@/details/details.service';
import { DetailsController } from '@/details/details.controller';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseDetail]), ReportsModule],
  providers: [DetailsService],
  controllers: [DetailsController],
})
export class DetailsModule {}
