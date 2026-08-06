import { TableCell } from 'pdfmake';
import { Expense } from '@/expenses/entities/expense.entity';
import { parseToDate } from '@/reports/utils';

export const getExpensesRows = (expenses: Expense[]): TableCell[][] =>
  expenses.flatMap((expense) =>
    expense.details.map((detail, index): TableCell[] => {
      if (index === 0) {
        return [
          {
            text: parseToDate(expense.expensedAt),
            rowSpan: expense.details.length,
            verticalAlignment: 'middle',
            alignment: 'center',
          },
          {
            text: expense.description,
            rowSpan: expense.details.length,
            verticalAlignment: 'middle',
          },
          {
            text: expense.group.name,
            rowSpan: expense.details.length,
            verticalAlignment: 'middle',
            alignment: 'center',
          },
          { text: detail.user.firstName, verticalAlignment: 'middle' },
          {
            text: `S/${detail.amount}`,
            alignment: 'right',
            verticalAlignment: 'middle',
          },
          {
            text: `S/${expense.amount}`,
            rowSpan: expense.details.length,
            verticalAlignment: 'middle',
            alignment: 'right',
          },
        ];
      }

      return [
        { text: '' },
        { text: '' },
        { text: '' },
        { text: detail.user.firstName, verticalAlignment: 'middle' },
        {
          text: `S/${detail.amount}`,
          alignment: 'right',
          verticalAlignment: 'middle',
        },
        { text: '' },
      ];
    }),
  );
