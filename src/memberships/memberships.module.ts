import { Module } from '@nestjs/common';
import { MembershipsService } from '@/memberships/memberships.service';
import { MembershipsController } from '@/memberships/memberships.controller';
import { Membership } from '@/memberships/entities/membership.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
})
export class MembershipsModule {}
