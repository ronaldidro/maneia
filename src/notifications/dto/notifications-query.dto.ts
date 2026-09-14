import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { NotificationStatus } from '@/notifications/enum/notification.enum';

export class NotificationsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}
