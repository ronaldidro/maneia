import {
  ContentColumns,
  StyleDictionary,
  TableLayout,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { QueryDto } from '@/common/dto/query.dto';
import { Payment } from '@/payments/entities/payment.entity';

export const formatDate = (date: Date | string) =>
  format(date, 'dd MMM yy', { locale: es });

export const PAY_DESCRIPTION = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  yape: 'Yape',
};

const styles: StyleDictionary = {
  h1: { fontSize: 16, bold: true },
  totals: { fontSize: 14, bold: true, alignment: 'right' },
};

export const baseDefinitions: TDocumentDefinitions = {
  styles,
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
  content: [],
};

export const tableLayout: TableLayout = {
  fillColor: (rowIndex) => (rowIndex === 0 ? '#E5E7EB' : null),
};

export const getContentColumns = (query: QueryDto): ContentColumns => {
  const { group, user, startDate, endDate } = query;

  return {
    columns: [
      { text: 'Grupo:', style: { bold: true }, width: 'auto' },
      { text: group ?? 'Todos' },
      { text: 'Miembro:', style: { bold: true }, width: 'auto' },
      { text: user ?? 'Todos' },
      { text: 'Fecha:', style: { bold: true }, width: 'auto' },
      {
        text:
          startDate && endDate
            ? `${formatDate(startDate)} al ${formatDate(endDate)}`
            : 'Todas',
      },
    ],
    columnGap: 5,
  };
};

export const getPaymentContentColumns = (payment: Payment): ContentColumns => ({
  columns: [
    {
      stack: [
        { text: [{ text: 'Recibe: ', bold: true }, payment.user.firstName] },
        '',
        { text: [{ text: 'Deuda: ', bold: true }, `S/${payment.debt}`] },
        '',
        {
          text: [
            { text: 'Fecha: ', bold: true },
            formatDate(payment.createdAt),
          ],
        },
      ],
    },
    {
      stack: [
        { text: [{ text: 'Paga: ', bold: true }, payment.payer.firstName] },
        '',
        { text: [{ text: 'Pago: ', bold: true }, `S/${payment.amount}`] },
        '',
        { text: [{ text: 'Grupo: ', bold: true }, payment.group.name] },
      ],
    },
    {
      stack: [
        {
          text: [
            { text: 'Método: ', bold: true },
            PAY_DESCRIPTION[payment.method],
          ],
        },
        '',
        {
          text: [{ text: 'Pendiente: ', bold: true }, `S/${payment.remaining}`],
        },
        '',
        { text: [{ text: 'Descripción: ', bold: true }, payment.description] },
      ],
    },
  ],
});

export * from '@/reports/utils/expenses.rows';
export * from '@/reports/utils/debts.rows';
export * from '@/reports/utils/payment-expenses.rows';
