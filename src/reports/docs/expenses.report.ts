import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Expense } from '@/expenses/entities/expense.entity';
import { QueryDto } from '@/common/dto/query.dto';
import {
  getExpensesRows,
  baseDefinitions,
  tableLayout,
  getContentColumns,
} from '@/reports/utils';
import { formatCurrency } from '@/common/helpers';

export const makeExpensesReport = (
  expenses: Expense[],
  query: QueryDto,
): TDocumentDefinitions => {
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

  const groupName = query.group ? expenses[0].group.name : undefined;

  const userName = query.user
    ? expenses[0].details.find((detail) => detail.user.id === query.user)?.user
        .firstName
    : undefined;

  return {
    ...baseDefinitions,
    content: [
      { text: 'Reporte de Gastos', style: 'h1' },
      '',
      getContentColumns({ ...query, group: groupName, user: userName }),
      '',
      {
        layout: tableLayout,
        table: {
          dontBreakRows: true,
          widths: [60, '*', 80, 105, 'auto', 'auto'],
          body: [
            [
              { text: 'Fecha', bold: true, alignment: 'center' },
              { text: 'Descripción', bold: true, alignment: 'center' },
              { text: 'Grupo', bold: true, alignment: 'center' },
              { text: 'Miembro', bold: true, alignment: 'center' },
              { text: 'Asignado', bold: true, alignment: 'center' },
              { text: 'Total', bold: true, alignment: 'center' },
            ],
            ...getExpensesRows(expenses),
            [
              { text: 'Total', colSpan: query.user ? 4 : 5, style: 'totals' },
              {},
              {},
              {},
              query.user
                ? { text: formatCurrency(totalDetails), style: 'totals' }
                : {},
              query.user
                ? {}
                : { text: formatCurrency(total), style: 'totals' },
            ],
          ],
        },
      },
    ],
  };
};
