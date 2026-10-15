import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BudgetEvent } from '@/events/memberships/budget.event';
import { MembershipsService } from '@/memberships/memberships.service';
import { MembershipSummaryDto } from '@/memberships/dto/membership-summary.dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron('0 9,21 * * *')
  async checkBudgetLimit() {
    this.logger.debug('*** Initializing Check Budget Limit Cron ***');

    const summaries = await this.membershipsService.summaries();

    for (const summary of summaries) {
      const budget = Number(summary.budget);
      const total = Number(summary.total);
      const remaining = budget - total;
      const limit = budget * 0.1;

      if (remaining < 0) {
        this.logger.debug(`Budget exceeded to ${summary.firstName}`);

        this.emitBudgetEvent('budget.exceeded', {
          ...summary,
          exceeded: (remaining * -1).toFixed(2),
        });

        continue;
      }

      if (remaining <= limit) {
        this.logger.debug(`Budget tight to limit for ${summary.firstName}`);

        this.emitBudgetEvent('budget.tight', {
          ...summary,
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
