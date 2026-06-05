import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DetailsService } from '@/details/details.service';
import { CurrentUser } from '@/decorator/user.decorator';
import { User } from '@/users/entities/user.entity';
import { DetailsSumQueryDto } from '@/details/dto/details-sum-query.dto';
import { DetailsQueryDto } from '@/details/dto/details-query.dto';

@ApiBearerAuth()
@Controller('details')
export class DetailsController {
  constructor(private readonly service: DetailsService) {}

  @Get()
  findAll(@Query() detailsQuery: DetailsQueryDto, @CurrentUser() user: User) {
    return this.service.findAll(detailsQuery, user);
  }

  @Get('sum')
  findSum(
    @Query() detailsSumQuery: DetailsSumQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.service.findSum(detailsSumQuery, user.id);
  }
}
