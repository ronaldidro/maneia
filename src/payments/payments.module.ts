import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from '@/payments/payments.service';
import { PaymentsController } from '@/payments/payments.controller';
import { Payment } from '@/payments/entities/payment.entity';
import { ReportsModule } from '@/reports/reports.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ReportsModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
