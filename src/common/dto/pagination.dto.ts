import { IntersectionType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { QueryDto } from '@/common/dto/query.dto';

export class PaginationDto {
  @IsInt()
  page: number = 1;

  @IsInt()
  limit: number = 10;
}

export class PaginatedQueryDto extends IntersectionType(
  QueryDto,
  PaginationDto,
) {}
