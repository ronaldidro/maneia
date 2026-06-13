import { Injectable, NotFoundException } from '@nestjs/common';
import pdfMake from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { User } from '@/users/entities/user.entity';
import { makeExpensesReport } from '@/reports/docs/expenses.report';
import { makeDebtsReport } from '@/reports/docs/debts.report';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { ReportType } from '@/reports/enum/report.enum';
import { ExpensesService } from '@/expenses/expenses.service';
import { DetailsService } from '@/details/details.service';

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly detailsService: DetailsService,
  ) {
    pdfMake.addFonts(fonts);
  }

  async create(
    createReportDto: CreateReportDto,
    user: User,
  ): Promise<Buffer<ArrayBufferLike>> {
    let document: TDocumentDefinitions = { content: [] };

    switch (createReportDto.type) {
      case ReportType.Expenses: {
        const expenses = await this.expensesService.findAll(
          createReportDto,
          user,
        );

        if (!expenses.length) throw new NotFoundException('Expenses not found');

        document = makeExpensesReport(expenses, createReportDto);

        break;
      }

      case ReportType.Debts: {
        const debts = await this.detailsService.findAll(createReportDto, user);

        if (!debts.length) throw new NotFoundException('Debts not found');

        document = makeDebtsReport(debts, createReportDto);

        break;
      }
    }

    return await pdfMake.createPdf(document).getBuffer();
  }
}
