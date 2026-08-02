export interface ExpenseTemplateData {
  debtorName: string;
  description: string;
  groupId: string;
  group: string;
  debtorId: string;
  payer: string;
  createdAt: string;
  deletedAt?: string;
  total: string;
  amount: string;
}

export interface PaymentTemplateData {
  paymentId: string;
  payer: string;
  description: string;
  group: string;
  creditor: string;
  method: string;
  createdAt: string;
  debt: string;
  amount: string;
  remaining: string;
}

export type MailTemplates = Record<
  'expense-created' | 'expense-deleted',
  ExpenseTemplateData
> & {
  'payment-created': PaymentTemplateData;
};

export type MailTemplate = keyof MailTemplates;
