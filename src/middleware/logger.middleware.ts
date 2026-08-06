import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('LoggerMiddleware', { timestamp: true });

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const isDevEnv = this.configService.get<boolean>('env.is_dev');
    const body = JSON.stringify(req.body) ?? '';

    if (isDevEnv)
      this.logger.log(
        `${req.method} ${req.originalUrl} ${body} ${res.statusCode}`,
      );

    next();
  }
}
