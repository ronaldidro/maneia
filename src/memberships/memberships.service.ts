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

  summaries(
    query?: QueryDto,
    withBudget: boolean = true,
  ): Promise<MembershipSummaryDto[]> {
    const builder = this.repository
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
      .groupBy('membership.id')
      .addGroupBy('member.id')
      .addGroupBy('group.id');

    if (withBudget) builder.where('membership.budget IS NOT NULL');

    if (query?.user)
      builder.andWhere('membership.user_id = :userId', {
        userId: query.user,
      });

    if (query?.group)
      builder.andWhere('membership.group_id = :groupId', {
        groupId: query.group,
      });

    return builder.getRawMany<MembershipSummaryDto>();
  }

  async summary(
    query: QueryDto,
  ): Promise<{ budget: number; total: number; percent: number }> {
    const summaries = await this.summaries(query, false);
    const summary = summaries[0];
    const response = { budget: 0, total: 0, percent: 0 };

    if (!summary) return response;

    response.budget = Number(summary.budget);
    response.total = Number(summary.total);
    response.percent = response.budget
      ? (response.total / response.budget) * 100
      : 0;

    return response;
  }
}
