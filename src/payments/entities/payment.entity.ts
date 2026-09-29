import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Transform } from 'class-transformer';
import { BaseEntity } from '@/common/base.entity';
import { PayMethod } from '@/payments/enum/payment.enum';
import { PaymentExpense } from '@/payments/interfaces';
import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';
import { formatDate } from '@/common/helpers';

@Entity({ name: 'payments' })
@Index(['group'])
@Index(['user'])
@Index(['payer'])
export class Payment extends BaseEntity {
  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  debt: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  remaining: string;

  @Column({ type: 'enum', enum: PayMethod })
  method: PayMethod;

  @Column({ type: 'jsonb' })
  expenses: PaymentExpense[];

  @Transform(({ value }: { value: Date }) => {
    if (!value) return;
    return formatDate(value, 'dd MMMM yyyy');
  })
  @Column({ type: 'timestamptz' })
  closedAt: Date;

  @ManyToOne(() => Group, (group) => group.payments)
  group: Group;

  @ManyToOne(() => User, (user) => user.createdPayments)
  user: User;

  @ManyToOne(() => User, (user) => user.receivedPayments)
  payer: User;
}
