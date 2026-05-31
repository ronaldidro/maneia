import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from '@/payments/payments.service';
import { PaymentsController } from '@/payments/payments.controller';
import { Payment } from '@/payments/entities/payment.entity';
import { Expense } from '@/expenses/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Expense])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
