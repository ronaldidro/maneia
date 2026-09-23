import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesService } from '@/schedules/schedules.service';
import { Membership } from '@/memberships/entities/membership.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Membership])],
  providers: [SchedulesService],
})
export class SchedulesModule {}
