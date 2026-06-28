import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Payment } from '@/payments/entities/payment.entity';
import {
  baseDefinitions,
  getPaymentContentColumns,
  getPaymentExpensesRows,
  tableLayout,
} from '@/reports/utils';

export const makePaymentReport = (payment: Payment): TDocumentDefinitions => {
  const total = payment.expenses.reduce(
    (acc, expense) =>
      acc +
      Number(
        expense.details.reduce((acc, detail) => acc + Number(detail.amount), 0),
      ),
    0,
  );

  return {
    ...baseDefinitions,
    content: [
      { text: 'Reporte de Pago', style: 'h1' },
      '',
      getPaymentContentColumns(payment),
      '',
      { text: 'Gastos cancelados', fontSize: 14, bold: true },
      '',
      {
        layout: tableLayout,
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: [50, '*', 'auto'],
          body: [
            [
              { text: 'Fecha', bold: true, alignment: 'center' },
              { text: 'Descripción', bold: true, alignment: 'center' },
              { text: 'Monto', bold: true, alignment: 'center' },
            ],
            ...getPaymentExpensesRows(payment.expenses),
            [
              { text: 'Total', colSpan: 2, style: 'totals' },
              {},
              { text: `S/${total.toFixed(2)}`, style: 'totals' },
            ],
          ],
        },
      },
      '',
      '',
      Number(payment.remaining) > 0
        ? {
            text: [
              { text: 'Nota:\n\n', bold: true },
              { text: 'Se registró un nuevo gasto con descripción ' },
              { text: 'Saldo pendiente de pago ', bold: true },
              { text: 'con el monto ' },
              { text: `S/${payment.remaining} `, bold: true },
              { text: `para el miembro ${payment.payer.firstName}.` },
            ],
          }
        : '',
    ],
  };
};
