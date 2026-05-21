import { Controller, Get, Query } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';
import { MembershipsQueryDto } from '@/memberships/dto/memberships-query.dto';

@ApiBearerAuth()
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  findAll(
    @Query() membershipsQuery: MembershipsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipsService.findAll(membershipsQuery, user);
  }
}
