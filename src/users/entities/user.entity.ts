import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../base/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Role } from '../../base/role.enum';
import { Group } from '../../groups/entities/group.entity';

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
}
