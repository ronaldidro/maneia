import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { Group } from '@/groups/entities/group.entity';
import { User } from '@/users/entities/user.entity';

@Entity({ name: 'memberships' })
@Unique(['user', 'group'])
export class Membership extends BaseEntity {
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  budget: string | null;

  @ManyToOne(() => User, (user) => user.memberships)
  public user: User;

  @ManyToOne(() => Group, (group) => group.memberships, {
    orphanedRowAction: 'delete',
  })
  public group: Group;
}
