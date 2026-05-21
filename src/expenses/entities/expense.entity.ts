import { Transform } from 'class-transformer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';
import { ExpenseDetail } from './expense-detail.entity';

@Entity({ name: 'expenses' })
@Index(['group', 'user'])
export class Expense extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Transform(({ value }) => {
    if (!value) return;
    return format(value, 'dd MMMM yyyy', { locale: es });
  })
  @Column({ type: 'timestamp' })
  expensedAt: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  @ManyToOne(() => Group, (group) => group.expenses)
  group: Group;

  @OneToMany(() => ExpenseDetail, (detail) => detail.expense, { cascade: true })
  details: ExpenseDetail[];
}
