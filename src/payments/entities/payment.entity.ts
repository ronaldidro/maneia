import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';
import { PayMethod } from '../../base/payment.enum';
import { Expose } from 'class-transformer';

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

  @Column({ type: 'enum', enum: PayMethod })
  method: PayMethod;

  @ManyToOne(() => Group, (group) => group.payments)
  group: Group;

  @ManyToOne(() => User, (user) => user.createdPayments)
  user: User;

  @ManyToOne(() => User, (user) => user.receivedPayments)
  payer: User;

  @Expose()
  get remaining(): string {
    return (Number(this.debt) - Number(this.amount)).toFixed(2);
  }
}
