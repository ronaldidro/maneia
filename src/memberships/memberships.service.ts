import { Injectable } from '@nestjs/common';
import { Membership } from '@/memberships/entities/membership.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { MembershipsQueryDto } from '@/memberships/dto/memberships-query.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
  ) {}

  async findAll(query: MembershipsQueryDto, user: User): Promise<Membership[]> {
    const { group } = query;

    const builder = this.repository
      .createQueryBuilder('membership')
      .select(['membership.id'])
      .leftJoin('membership.group', 'group')
      .addSelect(['group.name'])
      .leftJoin('membership.user', 'member')
      .addSelect(['member.id', 'member.firstName', 'member.lastName']);

    if (!user.isAdmin)
      builder.where('group.user_id = :userId', { userId: user.id });

    if (group) builder.andWhere('group.id = :groupId', { groupId: group });

    return await builder.getMany();
  }
}
