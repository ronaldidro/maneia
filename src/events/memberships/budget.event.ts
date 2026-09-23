import { BudgetData } from '@/events/memberships/interfaces';

export class BudgetEvent {
  constructor(public readonly data: BudgetData) {}
}
