import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { INestApplication } from '@nestjs/common';
import basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';

export function registerBullBoard(
  app: INestApplication,
  tokens: string[],
  config: ConfigService,
) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const adapters: BullAdapter[] = tokens.map((token) => {
    const queue = app.get<Queue>(getQueueToken(token));
    return new BullAdapter(queue);
  });

  createBullBoard({ queues: adapters, serverAdapter });

  const user = config.get<string>('board.user')!;
  const pass = config.get<string>('board.pass')!;

  app.use(
    '/queues',
    basicAuth({ users: { [user]: pass }, challenge: true }),
    serverAdapter.getRouter(),
  );
}
