import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { ReportsService } from '@/reports/reports.service';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="report.pdf"')
  async create(
    @Query() createReportDto: CreateReportDto,
    @CurrentUser() user: User,
  ) {
    const file = await this.reportsService.create(createReportDto, user);
    return new StreamableFile(file);
  }
}
