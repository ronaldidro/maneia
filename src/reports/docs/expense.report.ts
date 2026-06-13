import { Expense } from '@/expenses/entities/expense.entity';
import { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
import { formatDate, getExpensesRows } from '@/reports/utils';
import { QueryDto } from '@/common/dto/query.dto';

const styles: StyleDictionary = {
  h1: { fontSize: 16, bold: true },
  totals: { fontSize: 14, bold: true, alignment: 'right' },
};

export const makeExpenseReport = (
  expenses: Expense[],
  query: QueryDto,
): TDocumentDefinitions => {
  const { group, user, startDate, endDate } = query;

  const total = expenses.reduce(
    (acc, expense) => acc + Number(expense.amount),
    0,
  );

  const totalDetails = expenses.reduce(
    (acc, expense) =>
      acc +
      Number(
        expense.details.reduce((acc, detail) => acc + Number(detail.amount), 0),
      ),
    0,
  );

  return {
    styles,
    pageMargins: [40, 50],
    header: {
      text: 'Splitty',
      alignment: 'right',
      style: 'h1',
      margin: [15, 15],
    },
    footer: (currentPage, pageCount) => ({
      margin: [15, 15],
      text: currentPage.toString() + ' de ' + pageCount,
      bold: true,
    }),
    content: [
      { text: 'Reporte de Gastos', style: 'h1' },
      '',
      {
        columns: [
          { text: 'Grupo:', style: { bold: true }, width: 'auto' },
          { text: group ? expenses[0].group.name : 'Todos' },
          { text: 'Usuario:', style: { bold: true }, width: 'auto' },
          { text: user ? expenses[0].details[0].user.firstName : 'Todos' },
          { text: 'Fecha:', style: { bold: true }, width: 'auto' },
          {
            text:
              startDate && endDate
                ? `${formatDate(startDate)} al ${formatDate(endDate)}`
                : 'Todos',
          },
        ],
        columnGap: 5,
      },
      '',
      {
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? '#E5E7EB' : null),
        },
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: [50, '*', 80, 105, 'auto', 'auto'],
          body: [
            [
              { text: 'Fecha', bold: true, alignment: 'center' },
              { text: 'Descripción', bold: true, alignment: 'center' },
              { text: 'Grupo', bold: true, alignment: 'center' },
              { text: 'Miembro', bold: true, alignment: 'center' },
              { text: 'Monto', bold: true, alignment: 'center' },
              { text: 'Total', bold: true, alignment: 'center' },
            ],
            ...getExpensesRows(expenses),
            [
              { text: 'Total', colSpan: user ? 4 : 5, style: 'totals' },
              {},
              {},
              {},
              user
                ? { text: `S/${totalDetails.toFixed(2)}`, style: 'totals' }
                : {},
              user ? {} : { text: `S/${total.toFixed(2)}`, style: 'totals' },
            ],
          ],
        },
      },
    ],
  };
};
