import { Module } from '@nestjs/common';
import { GroupsService } from '@groups/groups.service';
import { GroupsController } from '@groups/groups.controller';
import { Group } from '@groups/entities/group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
