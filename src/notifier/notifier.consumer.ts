import { HttpClient } from '@nestjs/http-client';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { DiscordJobData } from '@/notifier/interfaces';

@Processor('notifier')
export class NotifierConsumer {
  constructor(private readonly httpClient: HttpClient) {}

  @Process('discord')
  async send(job: Job<DiscordJobData>) {
    const { webhookUrl, payload } = job.data;
    await this.httpClient.post(webhookUrl, { json: payload });
  }
}
