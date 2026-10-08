import { PaginatedQueryDto } from '@/common/dto/pagination.dto';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class DetailsQueryDto extends PaginatedQueryDto {}

export class DetailsSumQueryDto {
  @IsNotEmpty()
  @IsUUID()
  debtor: string;

  @IsNotEmpty()
  @IsUUID()
  group: string;

  @IsNotEmpty()
  @IsDateString()
  closedAt: string;
}
