import { IsEnum, IsNotEmpty } from 'class-validator';
import { QueryDto } from '@/common/dto/query.dto';
import { ReportType } from '@/reports/enum/report.enum';

export class CreateReportDto extends QueryDto {
  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;
}
