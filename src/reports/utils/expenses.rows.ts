import { TableCell } from 'pdfmake';
import { Expense } from '@/expenses/entities/expense.entity';
import { formatDate } from '@/reports/utils';

export const getExpensesRows = (expenses: Expense[]): TableCell[][] =>
  expenses.flatMap((expense) => {
    const detailsCount = expense.details.length;
    const rowSpan = expense.splitted ? detailsCount + 1 : detailsCount;

    if (detailsCount) {
      let rows: TableCell[][] = [];

      rows = expense.details.map((detail, index) => {
        if (index === 0) {
          return [
            {
              text: formatDate(expense.expensedAt),
              rowSpan,
              verticalAlignment: 'middle',
              alignment: 'center',
            },
            {
              text: expense.description,
              rowSpan,
              verticalAlignment: 'middle',
            },
            {
              text: expense.group.name,
              rowSpan,
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
              rowSpan,
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
      });

      if (expense.splitted)
        rows.push([
          { text: '' },
          { text: '' },
          { text: '' },
          { text: expense.user.firstName, verticalAlignment: 'middle' },
          {
            text: `S/${expense.details[0].amount}`,
            alignment: 'right',
            verticalAlignment: 'middle',
          },
          { text: '' },
        ]);

      return rows;
    }

    const detail = expense.details[0];
    return [
      [
        {
          text: formatDate(expense.expensedAt),
          alignment: 'center',
        },
        { text: expense.description },
        { text: expense.group.name, alignment: 'center' },
        {
          text: detail?.user.firstName ?? expense.user.firstName,
          verticalAlignment: 'middle',
        },
        {
          text: detail?.amount ? `S/${detail.amount}` : `S/${expense.amount}`,
          alignment: 'right',
          verticalAlignment: 'middle',
        },
        { text: `S/${expense.amount}`, alignment: 'right' },
      ],
    ];
  });
