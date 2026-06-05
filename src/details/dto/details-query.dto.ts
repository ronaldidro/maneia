import { PaginationDto } from '@/base/pagination.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DetailsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
