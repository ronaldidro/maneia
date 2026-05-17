import { Module } from '@nestjs/common';
import { GroupsService } from '@groups/groups.service';
import { GroupsController } from '@groups/groups.controller';
import { Group } from '@groups/entities/group.entity';
import { Membership } from '@groups/entities/membership.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Membership])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
