export enum NotificationType {
  ExpenseCreated = 'expense_created',
  ExpenseDeleted = 'expense_deleted',
  PaymentCreated = 'payment_created',
  BudgetExceeded = 'budget_exceeded',
  BudgetTight = 'budget_tight',
}

export enum NotificationEntityType {
  Expense = 'expense',
  Payment = 'payment',
  Membership = 'membership',
}

export enum NotificationSeverity {
  Success = 'success',
  Warn = 'warn',
  Info = 'info',
  Error = 'error',
}

export enum NotificationStatus {
  Read = 'read',
  Unread = 'unread',
}
