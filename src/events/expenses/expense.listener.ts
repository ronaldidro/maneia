import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExpenseEvent } from '@/events/expenses/expense.event';
import { EventService } from '@/events/event.service';
import {
  ExpenseData,
  ExpenseMail,
  ExpenseNotification,
} from '@/events/expenses/interfaces';
import { CreateMailer } from '@/mailer/create-mailer';
import { User } from '@/users/entities/user.entity';
import {
  NotificationType,
  NotificationEntityType,
  NotificationSeverity,
} from '@/notifications/enum/notification.enum';
import { formatDate } from '@/common/helpers';

@Injectable()
export class ExpenseListener {
  constructor(private readonly eventService: EventService) {}

  private static readonly TYPE_LABEL = {
    created: 'Gasto registrado',
    deleted: 'Gasto eliminado',
  } as const;

  @OnEvent('expense.created')
  async handleExpenseCreated(payload: ExpenseEvent) {
    const { data: expense, currentUser } = payload;

    const details = this.filterDebtorsDetail(expense, currentUser);

    for (const detail of details) {
      await this.sendMail({
        subject: ExpenseListener.TYPE_LABEL.created,
        template: 'expense-created',
        expense,
        detail,
        currentUser,
      });

      await this.sendNotification({
        title: ExpenseListener.TYPE_LABEL.created,
        description: `${expense.payer.firstName} registró un gasto de S/${expense.amount} en ${expense.group.name}`,
        type: NotificationType.ExpenseCreated,
        entityId: expense.id,
        user: detail.user,
        severity: NotificationSeverity.Info,
      });
    }
  }

  @OnEvent('expense.deleted')
  async handleExpenseDeleted(payload: ExpenseEvent) {
    const { data: expense, currentUser } = payload;

    const details = this.filterDebtorsDetail(expense, currentUser);

    for (const detail of details) {
      await this.sendMail({
        subject: ExpenseListener.TYPE_LABEL.deleted,
        template: 'expense-deleted',
        expense,
        detail,
        currentUser,
      });

      await this.sendNotification({
        title: ExpenseListener.TYPE_LABEL.deleted,
        description: `${expense.payer.firstName} eliminó un gasto de S/${expense.amount} en ${expense.group.name}`,
        type: NotificationType.ExpenseDeleted,
        entityId: expense.id,
        user: detail.user,
        severity: NotificationSeverity.Error,
      });
    }
  }

  private async sendMail({
    subject,
    template,
    expense,
    detail,
    currentUser,
  }: ExpenseMail) {
    await this.eventService.addMailJob(
      'expense-mail',
      new CreateMailer(
        detail.user.email,
        subject,
        template,
        {
          debtorName: detail.user.firstName,
          description: expense.description,
          groupId: expense.group.id,
          group: expense.group.name,
          debtorId: detail.user.id,
          payer: expense.payer.firstName,
          createdAt: this.parseToDate(expense.createdAt)!,
          deletedAt: this.parseToDate(expense.deletedAt),
          total: expense.amount,
          amount: detail.amount,
        },
        currentUser,
      ),
    );
  }

  private async sendNotification({
    title,
    description,
    type,
    entityId,
    user,
    severity,
  }: ExpenseNotification) {
    await this.eventService.createNotification(
      {
        title,
        description,
        type,
        entityId,
        entityType: NotificationEntityType.Expense,
        user,
      },
      severity,
    );
  }

  private filterDebtorsDetail(expense: ExpenseData, currentUser: User) {
    return expense.details.filter(
      (detail) => detail.user.id !== currentUser.id,
    );
  }

  private parseToDate(date?: Date) {
    return date ? formatDate(date, 'dd MMMM yyyy') : undefined;
  }
}
