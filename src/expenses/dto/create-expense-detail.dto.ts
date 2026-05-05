import { IsUUID, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateExpenseDetailDto {
  @IsNotEmpty()
  @IsUUID()
  user: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
