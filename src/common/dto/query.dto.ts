import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
