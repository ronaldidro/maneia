import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: string | number | Date, formatStr: string) =>
  format(date, formatStr, { locale: es });

export const formatCurrency = (amount: number | string) =>
  Number(amount).toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
  });
