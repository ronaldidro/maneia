import { Transform } from 'class-transformer';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { ExpenseDetail } from '@/details/entities/expense-detail.entity';
import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';
import { formatDate } from '@/common/helpers';

@Entity({ name: 'expenses' })
@Index(['group', 'user'])
export class Expense extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Transform(({ value }: { value: Date }) => {
    if (!value) return;
    return formatDate(value, 'dd MMMM yyyy');
  })
  @Column({ type: 'timestamptz' })
  expensedAt: Date;

  @Column()
  splitted: boolean;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  @ManyToOne(() => Group, (group) => group.expenses)
  group: Group;

  @OneToMany(() => ExpenseDetail, (detail) => detail.expense, { cascade: true })
  details: ExpenseDetail[];
}
