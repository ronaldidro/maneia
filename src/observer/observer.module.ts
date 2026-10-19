import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { Request } from 'express';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConditionalModule.registerWhen(
      ObserveModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          appKey: config.getOrThrow<string>('observe.app_key'),
          appSecret: config.getOrThrow<string>('observe.app_secret'),
          serviceId: config.getOrThrow<string>('observe.service_id'),
          http: {
            tags: { env: config.getOrThrow<string>('env.name') },
            capture: { body: true, slowerThanMs: 2000 },
            ignore: ['/api/health'],
            getUserId: (req: Request) => req.user?.id ?? 'anonymous',
            setAttributes: (req: Request) => ({
              'client-ip': req.ip ?? 'unknown',
            }),
          },
          jobs: {
            setAttributes: (job) => ({
              queueName: job.queueName,
              jobName: job.name,
            }),
          },
          forwardLogs: config.get<boolean>('env.is_prd'),
        }),
      }),
      (env: NodeJS.ProcessEnv) => env.NODE_ENV === 'prd',
    ),
  ],
})
export class ObserverModule {}
