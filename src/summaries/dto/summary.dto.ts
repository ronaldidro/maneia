export interface ChartDto {
  labels: string[];
  expensesData: number[];
  debtsData: number[];
}

export interface DayExpenseDto {
  date: string;
  expensesAmount: string;
  debtsAmount: string;
}

export interface ExpenseSummaryDetailDto {
  firstName: string;
  lastName: string;
  fullName: string;
  amount: string;
}

export interface ExpenseSummaryDto {
  user: string;
  expenses: number;
  amount: number;
  debts: number;
  debtors: ExpenseSummaryDetailDto[];
  creditors: ExpenseSummaryDetailDto[];
  chart: ChartDto;
}
