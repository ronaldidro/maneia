import { Injectable, NotFoundException } from '@nestjs/common';
import pdfMake from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { User } from '@/users/entities/user.entity';
import { makeExpenseReport } from '@/reports/docs/expense.report';
import { CreateReportDto } from '@/reports/dto/create-report.dto';
import { ReportType } from '@/reports/enum/report.enum';
import { ExpensesService } from '@/expenses/expenses.service';

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
  constructor(private readonly expensesService: ExpensesService) {
    pdfMake.addFonts(fonts);
  }

  async create(
    createReportDto: CreateReportDto,
    user: User,
  ): Promise<Buffer<ArrayBufferLike>> {
    let document: TDocumentDefinitions = { content: [] };

    switch (createReportDto.type) {
      case ReportType.Expense: {
        const expenses = await this.expensesService.findAll(
          createReportDto,
          user,
        );

        if (!expenses.length) throw new NotFoundException('Expenses not found');

        document = makeExpenseReport(expenses, createReportDto);
        break;
      }
    }

    return await pdfMake.createPdf(document).getBuffer();
  }
}
