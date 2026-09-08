import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  NotificationEntityType,
  NotificationType,
} from '@/notifications/enum/notification.enum';

class UserDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsNotEmpty()
  @IsUUID()
  entityId: string;

  @IsNotEmpty()
  @IsEnum(NotificationEntityType)
  entityType: NotificationEntityType;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}
