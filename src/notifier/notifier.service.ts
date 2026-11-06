import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { DiscordWebhookPayload } from '@/notifier/interfaces';

@Injectable()
export class NotifierService {
  constructor(
    @InjectQueue('notifier')
    private readonly notifierQueue: Queue,
  ) {}

  async sendDiscord(webhookUrl: string, payload: DiscordWebhookPayload) {
    await this.notifierQueue.add('discord', { webhookUrl, payload });
  }
}
