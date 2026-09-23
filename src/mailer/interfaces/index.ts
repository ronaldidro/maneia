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

export interface BudgetTemplateData {
  user: string;
  group: string;
  budget: string;
  total: string;
  exceeded?: string;
  remaining?: string;
}

export type MailTemplates = Record<
  'expense-created' | 'expense-deleted',
  ExpenseTemplateData
> & {
  'payment-created': PaymentTemplateData;
} & Record<'budget-exceeded' | 'budget-tight', BudgetTemplateData>;

export type MailTemplate = keyof MailTemplates;
