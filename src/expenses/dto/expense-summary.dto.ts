class ExpenseSummaryDetailDto {
  id: string;
  fullName: string;
  amount: number;
}

export class ExpenseSummaryDto {
  user: string;
  total: number;
  amount: number;
  debtors: ExpenseSummaryDetailDto[];
}
