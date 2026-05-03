import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../base/base.entity';
import { Entity, Column } from 'typeorm';
import { Role } from '../../base/role.enum';

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
}
