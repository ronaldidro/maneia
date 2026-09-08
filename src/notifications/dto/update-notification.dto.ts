import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from '@/notifications/dto/create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
