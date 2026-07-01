import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { QueryDto } from '@/common/dto/query.dto';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import {
  baseDefinitions,
  getContentColumns,
  getDebtsRows,
  tableLayout,
} from '@/reports/utils';

export const makeDebtsReport = (
  debts: ExpenseDetail[],
  query: QueryDto,
): TDocumentDefinitions => {
  const total = debts.reduce((acc, debt) => acc + Number(debt.amount), 0);
  const groupName = query.group ? debts[0].expense.group.name : undefined;
  const userName = query.user ? debts[0].expense.user.firstName : undefined;

  return {
    ...baseDefinitions,
    content: [
      { text: 'Reporte de Deudas', style: 'h1' },
      '',
      getContentColumns({ ...query, group: groupName, user: userName }),
      '',
      {
        layout: tableLayout,
        table: {
          dontBreakRows: true,
          widths: [50, '*', 80, 105, 'auto'],
          body: [
            [
              { text: 'Fecha', bold: true, alignment: 'center' },
              { text: 'Descripción', bold: true, alignment: 'center' },
              { text: 'Grupo', bold: true, alignment: 'center' },
              { text: 'Miembro', bold: true, alignment: 'center' },
              { text: 'Monto', bold: true, alignment: 'center' },
            ],
            ...getDebtsRows(debts),
            [
              { text: 'Total', colSpan: 4, style: 'totals' },
              {},
              {},
              {},
              { text: `S/${total.toFixed(2)}`, style: 'totals' },
            ],
          ],
        },
      },
    ],
  };
};
