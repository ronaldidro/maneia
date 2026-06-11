import { Controller, Get, Query } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MembershipsQueryDto } from '@/memberships/dto/memberships-query.dto';

@ApiBearerAuth()
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  findAll(@Query() membershipsQuery: MembershipsQueryDto) {
    return this.membershipsService.findAll(membershipsQuery);
  }
}
