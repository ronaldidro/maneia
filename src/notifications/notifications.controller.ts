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
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('stream')
  stream(@CurrentUser() user: User) {
    return this.notificationsService.stream(user.id);
  }

  @Get()
  findAll(@Query() query: PaginationDto, @CurrentUser() user: User) {
    return this.notificationsService.findAll(query, user);
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
