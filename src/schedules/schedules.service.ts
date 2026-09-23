import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Membership } from '@/memberships/entities/membership.entity';
import { MembershipSummaryDto } from '@/schedules/dto/schedule.dto';
import { BudgetEvent } from '@/events/memberships/budget.event';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 9,21 * * *')
  async checkBudgetLimit() {
    this.logger.debug('*** Initializing Check Budget Limit Cron ***');

    const results = await this.membershipRepository
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

    for (const result of results) {
      const budget = Number(result.budget);
      const total = Number(result.total);
      const remaining = budget - total;
      const limit = budget * 0.1;

      if (remaining < 0) {
        this.logger.debug(`Budget exceeded to ${result.firstName}`);

        this.emitBudgetEvent('budget.exceeded', {
          ...result,
          exceeded: (remaining * -1).toFixed(2),
        });

        continue;
      }

      if (remaining <= limit) {
        this.logger.debug(`Budget tight to limit for ${result.firstName}`);

        this.emitBudgetEvent('budget.tight', {
          ...result,
          remaining: remaining.toFixed(2),
        });
      }
    }

    this.logger.debug('*** Finished Check Budget Limit Cron ***');
  }

  private emitBudgetEvent(
    event: string,
    membershipSummary: MembershipSummaryDto,
  ) {
    this.eventEmitter.emit(
      event,
      new BudgetEvent({
        membership: {
          id: membershipSummary.id,
          member: {
            id: membershipSummary.userId,
            firstName: membershipSummary.firstName,
            email: membershipSummary.email,
          },
          group: { name: membershipSummary.groupName },
          budget: membershipSummary.budget,
        },
        total: membershipSummary.total,
        exceeded: membershipSummary.exceeded,
        remaining: membershipSummary.remaining,
      }),
    );
  }
}
