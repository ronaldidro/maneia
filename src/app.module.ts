import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '@/middleware/logger.middleware';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { GroupsModule } from '@/groups/groups.module';
import { ExpensesModule } from '@/expenses/expenses.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { PaymentsModule } from '@/payments/payments.module';
import { DetailsModule } from '@/details/details.module';
import { ReportsModule } from '@/reports/reports.module';
import { DatabaseModule } from '@/db/database.module';
import { ConfigurationModule } from '@/config/configuration.module';
import { EventsModule } from '@/events/events.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    EventsModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    MembershipsModule,
    ExpensesModule,
    DetailsModule,
    PaymentsModule,
    ReportsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
