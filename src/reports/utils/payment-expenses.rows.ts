import { TableCell } from 'pdfmake';
import { formatCurrency } from '@/common/helpers';
import { PaymentExpense } from '@/payments/interfaces';

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
      text: formatCurrency(expense.details[0].amount),
      alignment: 'right',
      verticalAlignment: 'middle',
    },
  ]);
