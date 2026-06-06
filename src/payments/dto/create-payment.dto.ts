import { PayMethod } from '@/payments/enum/payment.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  debt: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsEnum(PayMethod)
  method: PayMethod;

  @IsNotEmpty()
  @IsUUID()
  group: string;

  @IsNotEmpty()
  @IsUUID()
  payer: string;
}
