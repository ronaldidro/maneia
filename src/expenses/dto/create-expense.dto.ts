import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateDetailDto } from '@/details/dto/create-detail.dto';

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

  @IsNotEmpty()
  @IsBoolean()
  splitted: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailDto)
  details: CreateDetailDto[];
}
