import {
  ForbiddenException,
  Injectable,
  MessageEvent,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { filter, map, Observable, Subject } from 'rxjs';
import { User } from '@/users/entities/user.entity';
import { Notification } from '@/notifications/entities/notification.entity';
import { CreateNotificationDto } from '@/notifications/dto/create-notification.dto';
import { UpdateNotificationDto } from '@/notifications/dto/update-notification.dto';
import { NotificationSeverity } from '@/notifications/enum/notification.enum';

@Injectable()
export class NotificationsService {
  private subject = new Subject<{
    notification: Notification;
    severity: NotificationSeverity;
  }>();

  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  stream(userId: string): Observable<MessageEvent> {
    return this.subject.asObservable().pipe(
      // only user notification
      filter(({ notification }) => notification.user.id === userId),
      // sse format
      map(({ notification, severity }) => ({
        data: notification,
        type: severity,
      })),
    );
  }

  async create(
    createNotificationDto: CreateNotificationDto,
    severity: NotificationSeverity,
  ): Promise<Notification> {
    const notification = this.repository.create(createNotificationDto);

    const saved = await this.repository.save(notification);

    this.subject.next({ notification: saved, severity }); // emit by sse

    return saved;
  }

  async findAll(user: User): Promise<Notification[]> {
    return await this.repository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.repository.findOne({ where: { id } });

    if (!notification) throw new NotFoundException('Notification not found');

    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    user: User,
  ): Promise<UpdateResult> {
    const notification = await this.findOne(id);

    this.checkOwner(notification, user);

    return await this.repository.update({ id }, updateNotificationDto);
  }

  async remove(id: string, user: User): Promise<DeleteResult> {
    const notification = await this.findOne(id);

    this.checkOwner(notification, user);

    return await this.repository.delete(notification);
  }

  private checkOwner(notification: Notification, user: User): void {
    if (notification.user.id !== user.id)
      throw new ForbiddenException('Notification invalid');
  }
}
