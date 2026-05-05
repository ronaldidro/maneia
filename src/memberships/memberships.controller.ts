import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MembershipsService } from '@memberships/memberships.service';
import { CreateMembershipDto } from '@memberships/dto/create-membership.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@decorator/user.decorator';
import { User } from '@users/entities/user.entity';

@ApiBearerAuth()
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  create(
    @Body() createMembershipDto: CreateMembershipDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.create(createMembershipDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.membershipsService.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.findOne(id, user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.remove(id, user);
  }
}
