import { Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity({ name: 'memberships' })
@Unique(['user', 'group'])
export class Membership extends BaseEntity {
  @ManyToOne(() => User, (user) => user.memberships)
  public user: User;

  @ManyToOne(() => Group, (group) => group.memberships)
  public group: Group;
}
