import { BaseEntity } from '../../base/base.entity';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ExpenseDetail } from './expense-detail.entity';

@Entity({ name: 'expenses' })
@Index(['group', 'user'])
export class Expense extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  @ManyToOne(() => Group, (group) => group.expenses)
  group: Group;

  @OneToMany(() => ExpenseDetail, (detail) => detail.expense, { cascade: true })
  details: ExpenseDetail[];
}
