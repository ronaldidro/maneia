export enum NotificationType {
  ExpenseCreated = 'expense_created',
  ExpenseDeleted = 'expense_deleted',
  PaymentCreated = 'payment_created',
}

export enum NotificationEntityType {
  Expense = 'expense',
  Payment = 'payment',
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
