import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '@/memberships/entities/membership.entity';
import { UpdateMembershipDto } from '@/memberships/dto/update-membership.dto';
import { QueryDto } from '@/common/dto/query.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
  ) {}

  async findOne(id: string): Promise<Membership> {
    const membership = await this.repository.findOne({
      where: { id },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    return membership;
  }

  async update(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<UpdateResult> {
    await this.findOne(id);

    return await this.repository.update(id, {
      budget: updateMembershipDto.budget?.toString() ?? null,
    });
  }

  builder(query: QueryDto): Promise<{ budget: string } | undefined> {
    return this.repository
      .createQueryBuilder('membership')
      .select('membership.budget', 'budget')
      .where('membership.user_id = :userId', { userId: query.user })
      .andWhere('membership.group_id = :groupId', { groupId: query.group })
      .getRawOne<{ budget: string }>();
  }
}
