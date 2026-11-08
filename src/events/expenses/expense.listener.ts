import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { ExpenseEvent } from '@/events/expenses/expense.event';
import { EventService } from '@/events/event.service';
import {
  ExpenseData,
  ExpenseDiscordNotification,
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
import { formatCurrency, formatDate } from '@/common/helpers';

@Injectable()
export class ExpenseListener {
  constructor(
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
  ) {}

  private static readonly TYPE_LABEL = {
    created: 'Gasto registrado',
    deleted: 'Gasto eliminado',
  } as const;

  @OnEvent('expense.created')
  async handleExpenseCreated(payload: ExpenseEvent) {
    const { data: expense, currentUser } = payload;

    const details = this.filterDebtorsDetail(expense, currentUser);

    for (const detail of details) {
      await this.buildMail({
        subject: ExpenseListener.TYPE_LABEL.created,
        template: 'expense-created',
        expense,
        detail,
        currentUser,
      });

      await this.makeNotification({
        title: ExpenseListener.TYPE_LABEL.created,
        description: `${expense.payer.firstName} registró un gasto de ${formatCurrency(expense.amount)} en ${expense.group.name}`,
        type: NotificationType.ExpenseCreated,
        entityId: expense.id,
        user: detail.user,
        severity: NotificationSeverity.Info,
      });
    }

    if (expense.group.discordWebhook)
      await this.buildNotification({
        type: NotificationType.ExpenseCreated,
        webhookUrl: expense.group.discordWebhook,
        title: ExpenseListener.TYPE_LABEL.created,
        color: 3900150,
        expense,
        members: expense.details
          .map((detail) => detail.user.firstName)
          .join(', '),
      });
  }

  @OnEvent('expense.deleted')
  async handleExpenseDeleted(payload: ExpenseEvent) {
    const { data: expense, currentUser } = payload;

    const details = this.filterDebtorsDetail(expense, currentUser);

    for (const detail of details) {
      await this.buildMail({
        subject: ExpenseListener.TYPE_LABEL.deleted,
        template: 'expense-deleted',
        expense,
        detail,
        currentUser,
      });

      await this.makeNotification({
        title: ExpenseListener.TYPE_LABEL.deleted,
        description: `${expense.payer.firstName} eliminó un gasto de ${formatCurrency(expense.amount)} en ${expense.group.name}`,
        type: NotificationType.ExpenseDeleted,
        entityId: expense.id,
        user: detail.user,
        severity: NotificationSeverity.Error,
      });
    }

    if (expense.group.discordWebhook)
      await this.buildNotification({
        type: NotificationType.ExpenseDeleted,
        webhookUrl: expense.group.discordWebhook,
        title: ExpenseListener.TYPE_LABEL.deleted,
        color: 7041664,
        expense,
        members: expense.details
          .map((detail) => detail.user.firstName)
          .join(', '),
      });
  }

  private async buildMail({
    subject,
    template,
    expense,
    detail,
    currentUser,
  }: ExpenseMail) {
    await this.eventService.sendMail(
      'expense-mail',
      new CreateMailer(
        detail.user.email,
        subject,
        template,
        {
          expenseId: expense.id,
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

  private async makeNotification({
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

  private async buildNotification({
    type,
    webhookUrl,
    title,
    color,
    expense,
    members,
  }: ExpenseDiscordNotification) {
    const clientUrl = this.configService.get<string>('client.url');
    const baseUrl = `${clientUrl}/expenses`;
    const url =
      type === NotificationType.ExpenseCreated
        ? `${baseUrl}/${expense.id}`
        : baseUrl;

    const fields = this.buildFields(type, expense, members);

    await this.eventService.sendNotification(webhookUrl, {
      embeds: [{ title, url, color, fields }],
    });
  }

  private buildFields(
    type: NotificationType,
    expense: ExpenseData,
    members: string,
  ) {
    const dateFormat = 'dd MMMM yyyy hh:mm aaa';
    const amount = formatCurrency(expense.amount);
    const createdAt = this.parseToDate(expense.createdAt, dateFormat);

    const common = [
      { name: '📋 Descripción', value: `${expense.description}` },
      { name: '👥 Grupo', value: `${expense.group.name}` },
      { name: '🤝 Miembros', value: members },
      { name: '💰 Monto', value: `${amount}` },
    ];

    if (type === NotificationType.ExpenseCreated)
      return [
        { name: '📅 Fecha registro', value: `${createdAt}` },
        { name: '👤 Registrado por', value: `${expense.payer.firstName}` },
      ].concat(common);

    const deletedAt = this.parseToDate(expense.deletedAt, dateFormat);

    return [
      { name: '📅 Fecha registro', value: `${createdAt}` },
      { name: '👤 Eliminado por', value: `${expense.payer.firstName}` },
      { name: '📅 Fecha anulación', value: `${deletedAt}` },
    ].concat(common);
  }

  private filterDebtorsDetail(expense: ExpenseData, currentUser: User) {
    return expense.details.filter(
      (detail) => detail.user.id !== currentUser.id,
    );
  }

  private parseToDate(date?: Date, formatStr: string = 'dd MMMM yyyy') {
    return date ? formatDate(date, formatStr) : undefined;
  }
}
