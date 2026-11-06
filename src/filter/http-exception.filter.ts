import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { NotifierService } from '@/notifier/notifier.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name, {
    timestamp: true,
  });

  constructor(
    private readonly configService: ConfigService,
    private readonly notifierService: NotifierService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(exception.message ?? exception);
    this.logger.debug(exception.stack ?? exception.name);

    await this.notifyError(request, exception);

    response.status(status).json(exception.getResponse());
  }

  private async notifyError(request: Request, exception: HttpException) {
    const webhookUrl = this.configService.getOrThrow<string>(
      'notifier.discord_webhook',
    );

    const env = this.configService.getOrThrow<string>('env.name').toUpperCase();

    const formattedError = JSON.stringify(exception.getResponse(), null, 2);

    const payload = {
      embeds: [
        {
          title: `HTTP ${exception.getStatus()} - ${exception.name} \`${env}\``,
          color: 15158332,
          fields: [
            {
              name: 'Endpoint',
              value: `\`${request.method}\` ${request.originalUrl || request.url}`,
              inline: true,
            },
            {
              name: 'Client IP',
              value: request.ip || 'Unknown',
              inline: true,
            },
            {
              name: 'Error',
              value: `\`\`\`json\n${formattedError}\n\`\`\``,
              inline: false,
            },
            {
              name: 'Trace',
              value: `\`\`\`bash\n${exception.stack}\n\`\`\``,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await this.notifierService.sendDiscord(webhookUrl, payload);
  }
}
