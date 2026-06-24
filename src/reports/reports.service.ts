import pdfMake, { TCreatedPdf } from 'pdfmake';
import { Injectable } from '@nestjs/common';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { makeExpensesReport } from '@/reports/docs/expenses.report';
import { makeDebtsReport } from '@/reports/docs/debts.report';
import { QueryDto } from '@/common/dto/query.dto';

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
  constructor() {
    pdfMake.addFonts(fonts);
  }

  createExpensesPdf(expenses: Expense[], query: QueryDto): TCreatedPdf {
    const document = makeExpensesReport(expenses, query);
    return pdfMake.createPdf(document);
  }

  createDetailsPdf(details: ExpenseDetail[], query: QueryDto): TCreatedPdf {
    const document = makeDebtsReport(details, query);
    return pdfMake.createPdf(document);
  }
}
