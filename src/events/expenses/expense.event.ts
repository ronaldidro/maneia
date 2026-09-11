import { User } from '@/users/entities/user.entity';
import { ExpenseData } from '@/events/expenses/interfaces';

export class ExpenseEvent {
  constructor(
    public readonly currentUser: User,
    public readonly data: ExpenseData,
  ) {}
}
