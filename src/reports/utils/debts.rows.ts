import { TableCell } from 'pdfmake';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { formatDate } from '@/reports/utils';

export const getDebtsRows = (debts: ExpenseDetail[]): TableCell[][] =>
  debts.map(({ expense, amount }) => [
    {
      text: formatDate(expense.expensedAt),
      alignment: 'center',
      verticalAlignment: 'middle',
    },
    { text: expense.description },
    {
      text: expense.group.name,
      alignment: 'center',
      verticalAlignment: 'middle',
    },
    { text: expense.user.firstName, verticalAlignment: 'middle' },
    { text: `S/${amount}`, alignment: 'right', verticalAlignment: 'middle' },
  ]);
