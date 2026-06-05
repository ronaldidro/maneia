import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from '@/payments/payments.service';
import { PaymentsController } from '@/payments/payments.controller';
import { Payment } from '@/payments/entities/payment.entity';
import { SettlementsModule } from '@/settlements/settlements.module';
import { ExpensesModule } from '@/expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    SettlementsModule,
    ExpensesModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
