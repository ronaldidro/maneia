import { IsNotEmpty, IsUUID } from 'class-validator';

export class DetailsQueryDto {
  @IsNotEmpty()
  @IsUUID()
  debtor: string;

  @IsNotEmpty()
  @IsUUID()
  group: string;
}
