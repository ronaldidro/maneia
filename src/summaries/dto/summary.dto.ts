export class ExpenseSummaryDetailDto {
  firstName: string;
  lastName: string;
  fullName: string;
  amount: string;
}

export class ExpenseSummaryDto {
  user: string;
  expenses: number;
  amount: number;
  debts: number;
  debtors: ExpenseSummaryDetailDto[];
  creditors: ExpenseSummaryDetailDto[];
}
