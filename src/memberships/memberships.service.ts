import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '@/memberships/entities/membership.entity';
import { UpdateMembershipDto } from '@/memberships/dto/update-membership.dto';
import { MembershipSummaryDto } from '@/memberships/dto/membership-summary.dto';
import { QueryDto } from '@/common/dto/query.dto';
import { BaseService } from '@/common/base.service';

@Injectable()
export class MembershipsService extends BaseService<Membership> {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
  ) {
    super(repository);
  }

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

  summary() {
    return this.repository
      .createQueryBuilder('membership')
      .select(['membership.id AS id', 'membership.budget AS budget'])
      .leftJoin('membership.user', 'member')
      .addSelect([
        'member.id AS "userId"',
        'member.firstName AS "firstName"',
        'member.email AS email',
      ])
      .leftJoin('membership.group', 'group')
      .addSelect(['group.id AS "groupId"', 'group.name AS "groupName"'])
      .leftJoin('member.expenses', 'expense', 'expense.group_id = group.id')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('membership.budget IS NOT NULL')
      .groupBy('membership.id')
      .addGroupBy('member.id')
      .addGroupBy('group.id')
      .getRawMany<MembershipSummaryDto>();
  }
}
