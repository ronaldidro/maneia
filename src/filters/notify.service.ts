import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifierService } from '@/notifier/notifier.service';
import type { Request } from 'express';

@Injectable()
export class NotifyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notifierService: NotifierService,
  ) {}

  async send(
    request: Request,
    response: object | string,
    status: number,
    exception: Error | HttpException,
  ) {
    const isDev = this.configService.get<boolean>('env.is_dev');

    if (isDev) return;

    const webhookUrl = this.configService.getOrThrow<string>(
      'notifier.discord_webhook',
    );

    const payload = this.generatePayload(request, response, status, exception);

    await this.notifierService.sendDiscord(webhookUrl, payload);
  }

  private generatePayload(
    request: Request,
    response: object | string,
    status: number,
    exception: Error | HttpException,
  ) {
    const formattedError = JSON.stringify(response, null, 2).substring(0, 1000);
    const formattedBody = JSON.stringify(request.body, null, 2).substring(
      0,
      1000,
    );

    return {
      embeds: [
        {
          title: `HTTP ${status} - ${exception.name}`,
          color: 15158332,
          fields: [
            {
              name: 'Endpoint',
              value: `\`${request.method}\` ${request.originalUrl || request.url}`,
              inline: true,
            },
            {
              name: 'User Id',
              value: request.user?.id || 'Unknown',
              inline: true,
            },
            {
              name: 'Body',
              value: `\`\`\`json\n${formattedBody}\n\`\`\``,
              inline: false,
            },
            {
              name: 'Error',
              value: `\`\`\`json\n${formattedError}\n\`\`\``,
              inline: false,
            },
            {
              name: 'Trace',
              value: `\`\`\`bash\n${exception.stack?.substring(0, 1000)}\n\`\`\``,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}
