export class ExpenseSummaryDetailDto {
  fullName: string;
  amount: number;
}

export class ExpenseSummaryDto {
  user: string;
  expenses: number;
  amount: number;
  debts: number;
  debtors: ExpenseSummaryDetailDto[];
  creditors: ExpenseSummaryDetailDto[];
}
