import { PaymentExpense } from '@/payments/interfaces';
import { TableCell } from 'pdfmake';

export const getPaymentExpensesRows = (
  expenses: PaymentExpense[],
): TableCell[][] =>
  expenses.map((expense) => [
    {
      text: expense.expensedAt,
      alignment: 'center',
      verticalAlignment: 'middle',
    },
    { text: expense.description },
    {
      text: `S/${expense.details[0].amount}`,
      alignment: 'right',
      verticalAlignment: 'middle',
    },
  ]);
