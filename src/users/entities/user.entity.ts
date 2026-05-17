import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../base/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Role } from '../../base/role.enum';
import { Group } from '../../groups/entities/group.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseDetail } from '../../expenses/entities/expense-detail.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToMany(() => Group, (group) => group.user)
  groups: Group[];

  @OneToMany(() => Membership, (membership) => membership.user)
  memberships: Membership[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => ExpenseDetail, (debt) => debt.user)
  debts: ExpenseDetail[];

  get isAdmin(): boolean {
    return this.role === Role.Admin;
  }
}
