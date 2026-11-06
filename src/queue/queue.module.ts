import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('queue.host'),
          port: config.get<number>('queue.port'),
          username: config.get<string>('queue.user'),
          password: config.get<string>('queue.pass'),
          tls: config.get<boolean>('env.is_prd')
            ? { rejectUnauthorized: false }
            : undefined,
          maxRetriesPerRequest: 0,
        },
      }),
    }),
  ],
})
export class QueueModule {}
