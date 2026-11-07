import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from '@/groups/groups.service';
import { GroupSubscriber } from '@/groups/group.subscriber';
import { GroupsController } from '@/groups/groups.controller';
import { Group } from '@/groups/entities/group.entity';
import { MembershipsModule } from '@/memberships/memberships.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), MembershipsModule, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupSubscriber],
  exports: [GroupsService],
})
export class GroupsModule {}
