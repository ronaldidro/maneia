import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  SoftRemoveEvent,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment } from '@/payments/entities/payment.entity';
import { PaymentEvent } from '@/events/payments/payment.event';
import { PAY_DESCRIPTION } from '@/common/constants';

@EventSubscriber()
export class PaymentSubscriber implements EntitySubscriberInterface<Payment> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Payment;
  }

  async afterInsert(event: InsertEvent<Payment>) {
    const payment = await event.manager.findOne(Payment, {
      select: {
        id: true,
        description: true,
        debt: true,
        amount: true,
        remaining: true,
        method: true,
        createdAt: true,
        closedAt: true,
        group: { id: true, name: true },
        user: { id: true, firstName: true },
        payer: { id: true, firstName: true, email: true },
      },
      where: { id: event.entity.id },
      relations: { group: true, user: true, payer: true },
    });

    if (payment) this.emitEvent('payment.created', payment);
  }

  afterSoftRemove(event: SoftRemoveEvent<Payment>) {
    const id = event.entityId as string;
    let payment = event.entity;

    if (id && payment) {
      payment = { ...payment, id, deletedAt: new Date() };
      this.emitEvent('payment.deleted', payment);
    }
  }

  private emitEvent(event: string, payment: Payment) {
    this.eventEmitter.emit(
      event,
      new PaymentEvent({
        id: payment.id,
        payer: {
          id: payment.payer.id,
          firstName: payment.payer.firstName,
          email: payment.payer.email,
        },
        description: payment.description,
        group: { name: payment.group.name },
        creditor: { firstName: payment.user.firstName },
        method: PAY_DESCRIPTION[payment.method],
        createdAt: payment.createdAt,
        closedAt: payment.closedAt,
        deletedAt: payment.deletedAt,
        debt: payment.debt,
        amount: payment.amount,
        remaining: payment.remaining,
      }),
    );
  }
}
