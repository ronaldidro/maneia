import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { LoggerMiddleware } from '@/middleware/logger.middleware';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { GroupsModule } from '@/groups/groups.module';
import { ExpensesModule } from '@/expenses/expenses.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { PaymentsModule } from '@/payments/payments.module';
import { ReportsModule } from '@/reports/reports.module';
import { DatabaseModule } from '@/db/database.module';
import { ConfigurationModule } from '@/config/configuration.module';
import { EventsModule } from '@/events/events.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { SchedulesModule } from '@/schedules/schedules.module';
import { ObserverModule } from '@/observer/observer.module';
import { HealthModule } from '@/health/health.module';
import { TranslationModule } from '@/translation/translation.module';
import { QueueModule } from '@/queue/queue.module';
import { NotifierModule } from '@/notifier/notifier.module';

@Module({
  imports: [
    ConfigurationModule,
    ObserverModule,
    DatabaseModule,
    HealthModule,
    QueueModule,
    TranslationModule,
    EventsModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    MembershipsModule,
    ExpensesModule,
    PaymentsModule,
    ReportsModule,
    NotificationsModule,
    SchedulesModule,
    NotifierModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
