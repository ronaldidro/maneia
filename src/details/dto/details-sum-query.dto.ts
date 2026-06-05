import { IsNotEmpty, IsUUID } from 'class-validator';

export class DetailsSumQueryDto {
  @IsNotEmpty()
  @IsUUID()
  debtor: string;

  @IsNotEmpty()
  @IsUUID()
  group: string;
}
