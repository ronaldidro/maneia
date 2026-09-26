import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from '@/payments/payments.service';
import { PaymentsController } from '@/payments/payments.controller';
import { Payment } from '@/payments/entities/payment.entity';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ReportsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
