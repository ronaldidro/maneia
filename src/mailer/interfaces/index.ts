export interface ExpenseCreatedTemplateData {
  debtorName: string;
  description: string;
  groupId: string;
  group: string;
  debtorId: string;
  payer: string;
  date: string;
  total: string;
  amount: string;
}

export interface MailTemplates {
  'expense-created': ExpenseCreatedTemplateData;
}

export type MailTemplate = keyof MailTemplates;
