import { EventService } from '@/events/event.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BudgetEvent } from '@/events/memberships/budget.event';
import {
  BudgetMail,
  BudgetNotification,
} from '@/events/memberships/interfaces';
import { CreateMailer } from '@/mailer/create-mailer';
import {
  NotificationEntityType,
  NotificationSeverity,
  NotificationType,
} from '@/notifications/enum/notification.enum';

@Injectable()
export class MembershipListener {
  constructor(private readonly eventService: EventService) {}

  private static readonly TYPE_LABEL = {
    exceeded: 'Presupuesto excedido',
    tight: 'Presupuesto ajustado',
  } as const;

  @OnEvent('budget.exceeded')
  async handleBudgetExceeded(payload: BudgetEvent) {
    const { data } = payload;

    await this.sendMail({
      subject: MembershipListener.TYPE_LABEL.exceeded,
      template: 'budget-exceeded',
      data,
    });

    await this.sendNotification({
      title: MembershipListener.TYPE_LABEL.exceeded,
      description: `Has excedido el presupuesto de S/${data.membership.budget} en ${data.membership.group.name}`,
      type: NotificationType.BudgetExceeded,
      entityId: data.membership.id,
      user: data.membership.member,
      severity: NotificationSeverity.Error,
    });
  }

  @OnEvent('budget.tight')
  async handleBudgetTight(payload: BudgetEvent) {
    const { data } = payload;

    await this.sendMail({
      subject: MembershipListener.TYPE_LABEL.tight,
      template: 'budget-tight',
      data,
    });

    await this.sendNotification({
      title: MembershipListener.TYPE_LABEL.tight,
      description: `Te queda solo S/${data.remaining} del presupuesto de S/${data.membership.budget} en ${data.membership.group.name}`,
      type: NotificationType.BudgetTight,
      entityId: data.membership.id,
      user: data.membership.member,
      severity: NotificationSeverity.Warn,
    });
  }

  private async sendMail({ subject, template, data }: BudgetMail) {
    await this.eventService.addMailJob(
      'budget-mail',
      new CreateMailer(data.membership.member.email, subject, template, {
        user: data.membership.member.firstName,
        group: data.membership.group.name,
        budget: data.membership.budget,
        total: data.total,
        exceeded: data.exceeded,
        remaining: data.remaining,
      }),
    );
  }

  private async sendNotification({
    title,
    description,
    type,
    entityId,
    user,
    severity,
  }: BudgetNotification) {
    await this.eventService.createNotification(
      {
        title,
        description,
        type,
        entityId,
        entityType: NotificationEntityType.Membership,
        user,
      },
      severity,
    );
  }
}
