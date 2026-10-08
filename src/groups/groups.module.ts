import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from '@/groups/groups.service';
import { GroupsController } from '@/groups/groups.controller';
import { Group } from '@/groups/entities/group.entity';
import { MembershipsModule } from '@/memberships/memberships.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), MembershipsModule, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
