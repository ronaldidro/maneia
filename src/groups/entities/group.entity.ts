import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'groups' })
export class Group extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.groups)
  user: User;
}
