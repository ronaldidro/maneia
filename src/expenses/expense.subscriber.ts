import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@/users/entities/user.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { ExpenseEvent } from '@/events/expenses/expense.event';

@EventSubscriber()
export class ExpenseSubscriber implements EntitySubscriberInterface<Expense> {
  constructor(
    dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Expense;
  }

  async afterInsert(event: InsertEvent<Expense>) {
    const expense = await event.manager.findOne(Expense, {
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        expensedAt: true,
        group: { id: true, name: true },
        user: { id: true, firstName: true },
        details: {
          id: true,
          amount: true,
          user: { id: true, firstName: true, email: true },
        },
      },
      where: { id: event.entity.id },
      relations: { details: { user: true }, group: true, user: true },
    });

    if (expense) this.emitEvent('expense.created', expense, expense.user);
  }

  afterRemove(event: RemoveEvent<Expense>) {
    const id = event.entityId as string;
    let expense = event.entity;

    if (id && expense) {
      expense = { ...expense, id, deletedAt: new Date() };
      this.emitEvent('expense.deleted', expense, expense.user);
    }
  }

  private emitEvent(event: string, expense: Expense, user: User) {
    this.eventEmitter.emit(
      event,
      new ExpenseEvent(user, {
        id: expense.id,
        description: expense.description,
        group: { id: expense.group.id, name: expense.group.name },
        payer: { firstName: expense.user.firstName },
        createdAt: expense.expensedAt,
        deletedAt: expense.deletedAt,
        amount: expense.amount,
        details: expense.details.map(({ user, amount }) => ({
          user: { id: user.id, firstName: user.firstName, email: user.email },
          amount: amount,
        })),
      }),
    );
  }
}
