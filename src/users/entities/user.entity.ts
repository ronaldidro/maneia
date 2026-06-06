import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from '../../common/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Role } from '../../common/enum/role.enum';
import { Group } from '../../groups/entities/group.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseDetail } from '../../details/entities/expense-detail.entity';
import { Payment } from '../../payments/entities/payment.entity';

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

  @OneToMany(() => Payment, (payment) => payment.user)
  createdPayments: Payment[];

  @OneToMany(() => Payment, (payment) => payment.payer)
  receivedPayments: Payment[];

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdmin(): boolean {
    return this.role === Role.Admin;
  }
}
