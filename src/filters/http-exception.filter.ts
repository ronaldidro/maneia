import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { NotifyService } from '@/filters/notify.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name, {
    timestamp: true,
  });

  constructor(private readonly notifyService: NotifyService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(exception.message ?? exception);
    this.logger.debug(exception.stack ?? exception.name);

    await this.notifyService.send(
      request,
      exception.getResponse(),
      status,
      exception,
    );

    response.status(status).json(exception.getResponse());
  }
}
