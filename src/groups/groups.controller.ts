import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GroupsService } from '@groups/groups.service';
import { CreateGroupDto } from '@groups/dto/create-group.dto';
import { UpdateGroupDto } from '@groups/dto/update-group.dto';
import { CurrentUser } from '@decorator/user.decorator';
import { User } from '@users/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @CurrentUser() user: User) {
    return this.groupsService.create(createGroupDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.groupsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.update(id, updateGroupDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.groupsService.remove(id, user.id);
  }
}
