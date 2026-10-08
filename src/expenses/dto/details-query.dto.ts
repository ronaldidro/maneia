import { QueryDto } from '@/common/dto/query.dto';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class DetailsQueryDto extends QueryDto {
  @IsNotEmpty()
  @IsDateString()
  closedAt: string;
}
