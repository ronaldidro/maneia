import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '@/middleware/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { GroupsModule } from '@/groups/groups.module';
import { ExpensesModule } from '@/expenses/expenses.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { PaymentsModule } from '@/payments/payments.module';
import { DetailsModule } from '@/details/details.module';
import configOptions from '@/config/config.options';
import getDbConfig from '@/db/config';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDbConfig,
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
    MembershipsModule,
    ExpensesModule,
    DetailsModule,
    PaymentsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
