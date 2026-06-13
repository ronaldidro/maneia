import {
  ContentColumns,
  StyleDictionary,
  TableLayout,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { QueryDto } from '@/common/dto/query.dto';

export const formatDate = (date: Date | string) =>
  format(date, 'dd MMM yy', { locale: es });

const styles: StyleDictionary = {
  h1: { fontSize: 16, bold: true },
  totals: { fontSize: 14, bold: true, alignment: 'right' },
};

export const baseDefinitions: TDocumentDefinitions = {
  styles,
  pageMargins: [40, 50],
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

export * from '@/reports/utils/expenses.rows';
export * from '@/reports/utils/debts.rows';
