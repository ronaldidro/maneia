import { PaymentData } from '@/events/payments/interfaces';

export class PaymentEvent {
  constructor(public readonly data: PaymentData) {}
}
