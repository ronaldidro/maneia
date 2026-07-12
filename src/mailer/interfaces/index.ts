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

export interface MailTemplates {
  'expense-created': ExpenseTemplateData;
  'expense-deleted': ExpenseTemplateData;
}

export type MailTemplate = keyof MailTemplates;
