export class ExpenseCreatedEvent {
  constructor(
    public readonly expense: {
      description: string;
      group: { name: string };
      payer: { firstName: string };
      expensedAt: Date;
      details: {
        email: string;
        amount: string;
      }[];
    },
  ) {}
}
