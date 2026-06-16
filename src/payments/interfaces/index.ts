export interface PaymentExpense {
  id: string;
  description: string;
  amount: string;
  splitted: boolean;
  expensedAt: string;
  group: Group;
  owner: User;
  details: {
    debtor: User;
    amount: string;
  }[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
}
