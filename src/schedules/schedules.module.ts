import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesService } from '@/schedules/schedules.service';
import { MembershipsModule } from '@/memberships/memberships.module';

@Module({
  imports: [ScheduleModule.forRoot(), MembershipsModule],
  providers: [SchedulesService],
})
export class SchedulesModule {}
