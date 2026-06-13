import { Expense } from '@/expenses/entities/expense.entity';
import { TableCell } from 'pdfmake/interfaces';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string) =>
  format(date, 'dd MMM yy', { locale: es });

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
              verticalAlignment: 'middle' as const,
              alignment: 'center',
            },
            {
              text: expense.description,
              rowSpan,
              verticalAlignment: 'middle' as const,
            },
            {
              text: expense.group.name,
              rowSpan,
              verticalAlignment: 'middle' as const,
              alignment: 'center',
            },
            { text: detail.user.firstName },
            { text: `S/${detail.amount}`, alignment: 'right' },
            {
              text: `S/${expense.amount}`,
              rowSpan,
              verticalAlignment: 'middle' as const,
              alignment: 'right',
            },
          ];
        }

        return [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: detail.user.firstName },
          { text: `S/${detail.amount}`, alignment: 'right' },
          { text: '' },
        ];
      });

      if (expense.splitted)
        rows.push([
          { text: '' },
          { text: '' },
          { text: '' },
          { text: expense.user.firstName },
          { text: `S/${expense.details[0].amount}`, alignment: 'right' },
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
        },
        {
          text: detail?.amount ? `S/${detail.amount}` : `S/${expense.amount}`,
          alignment: 'right',
        },
        { text: `S/${expense.amount}`, alignment: 'right' },
      ],
    ];
  });
