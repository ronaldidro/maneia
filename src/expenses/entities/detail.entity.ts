import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { User } from '@/users/entities/user.entity';

@Entity({ name: 'expense-details' })
@Index(['expense', 'user'])
export class ExpenseDetail extends BaseEntity {
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @ManyToOne(() => User, (user) => user.debts)
  user: User;

  @ManyToOne(() => Expense, (expense) => expense.details, {
    onDelete: 'CASCADE',
  })
  expense: Expense;
}
