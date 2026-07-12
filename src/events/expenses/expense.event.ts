import { User } from '@/users/entities/user.entity';

export class ExpenseCreatedEvent {
  constructor(
    public readonly currentUser: User,
    public readonly expense: {
      description: string;
      group: { id: string; name: string };
      payer: { firstName: string };
      expensedAt: Date;
      amount: string;
      details: {
        user: { id: string; firstName: string; email: string };
        amount: string;
      }[];
    },
  ) {}
}
