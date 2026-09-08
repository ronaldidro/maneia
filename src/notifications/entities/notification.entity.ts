import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/base.entity';
import { User } from '@/users/entities/user.entity';
import {
  NotificationType,
  NotificationEntityType,
} from '@/notifications/enum/notification.enum';

@Entity('notifications')
@Index(['user', 'isRead'])
export class Notification extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column('uuid')
  entityId: string;

  @Column({ type: 'enum', enum: NotificationEntityType })
  entityType: NotificationEntityType;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;
}
