import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity({ name: 'groups' })
export class Group extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups)
  user: User;

  @OneToMany(() => Membership, (membership) => membership.group, {
    cascade: true,
  })
  memberships: Membership[];

  @OneToMany(() => Expense, (expense) => expense.group)
  expenses: Expense[];

  @OneToMany(() => Payment, (payment) => payment.group)
  payments: Payment[];
}
