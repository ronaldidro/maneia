import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { NotifyService } from '@/filters/notify.service';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchEverythingFilter.name, {
    timestamp: true,
  });

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly notifyService: NotifyService,
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    this.logger.error(exception.message ?? exception);
    this.logger.debug(exception.stack ?? exception.name);

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      error: exception.name,
      message: exception.message,
    };

    await this.notifyService.send(request, responseBody, httpStatus, exception);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
