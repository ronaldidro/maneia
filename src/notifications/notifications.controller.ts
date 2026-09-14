import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from '@/notifications/notifications.service';
import { UpdateNotificationDto } from '@/notifications/dto/update-notification.dto';
import { NotificationsQueryDto } from '@/notifications/dto/notifications-query.dto';
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(@CurrentUser() user: User) {
    return this.notificationsService.stream(user.id);
  }

  @Get()
  findAll(
    @Query() notificationsQuery: NotificationsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.findAll(notificationsQuery, user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.update(id, updateNotificationDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.remove(id, user);
  }
}
