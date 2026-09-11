import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService } from '@/events/event.service';
import { PaymentEvent } from '@/events/payments/payment.event';
import { PaymentMail, PaymentNotification } from '@/events/payments/interfaces';
import {
  NotificationType,
  NotificationEntityType,
  NotificationSeverity,
} from '@/notifications/enum/notification.enum';
import { CreateMailer } from '@/mailer/create-mailer';
import { formatDate } from '@/common/helpers';

@Injectable()
export class PaymentListener {
  constructor(private readonly eventService: EventService) {}

  @OnEvent('payment.created')
  async handlePaymentCreated(payload: PaymentEvent) {
    const { data: payment } = payload;

    await this.sendMail({
      subject: 'Nuevo pago registrado',
      template: 'payment-created',
      payment,
    });

    await this.sendNotification({
      title: 'Nuevo pago registrado',
      description: `${payment.creditor.firstName} registró un pago de S/${payment.amount} en ${payment.group.name}`,
      type: NotificationType.PaymentCreated,
      entityId: payment.id,
      user: payment.payer,
      severity: NotificationSeverity.Info,
    });
  }

  private async sendMail({ subject, template, payment }: PaymentMail) {
    await this.eventService.addMailJob(
      'payment-mail',
      new CreateMailer(payment.payer.email, subject, template, {
        paymentId: payment.id,
        payer: payment.payer.firstName,
        description: payment.description,
        group: payment.group.name,
        creditor: payment.creditor.firstName,
        method: payment.method,
        createdAt: this.parseToDate(payment.createdAt)!,
        debt: payment.debt,
        amount: payment.amount,
        remaining: payment.remaining,
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
  }: PaymentNotification) {
    await this.eventService.createNotification(
      {
        title,
        description,
        type,
        entityId,
        entityType: NotificationEntityType.Payment,
        user,
      },
      severity,
    );
  }

  private parseToDate(date?: Date) {
    return date ? formatDate(date, 'dd MMMM yyyy') : undefined;
  }
}
