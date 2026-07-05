export interface ExpenseCreatedTemplateData {
  description: string;
  group: string;
  payer: string;
  date: string;
  amount: string;
}

export interface MailTemplates {
  'expense-created': ExpenseCreatedTemplateData;
}

export type MailTemplate = keyof MailTemplates;
