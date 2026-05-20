import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional()
  @IsInt()
  page: number = 1;

  @ApiPropertyOptional()
  @IsInt()
  limit: number = 10;
}
