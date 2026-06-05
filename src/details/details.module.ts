import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetailsService } from '@/details/details.service';
import { DetailsController } from '@/details/details.controller';
import { ExpenseDetail } from '@/expenses/entities/expense-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseDetail])],
  providers: [DetailsService],
  controllers: [DetailsController],
})
export class DetailsModule {}
