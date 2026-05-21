import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateExpenseDetailDto } from '@/expenses/dto/create-expense-detail.dto';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsDateString()
  expensedAt: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsUUID()
  group: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDetailDto)
  details: CreateExpenseDetailDto[];
}
