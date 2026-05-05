import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 1 })
  @IsInt()
  page: number;

  @ApiProperty({ default: 10 })
  @IsInt()
  limit: number;
}
