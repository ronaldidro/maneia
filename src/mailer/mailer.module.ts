import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from '@/mailer/mailer.service';
import { MailerController } from './mailer.controller';

@Module({
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: config.get<string>('mailer.user'),
            clientId: config.get<string>('mailer.client_id'),
            clientSecret: config.get<string>('mailer.client_secret'),
            refreshToken: config.get<string>('mailer.refresh_token'),
          },
        },
      }),
    }),
  ],
  providers: [MailerService],
  controllers: [MailerController],
})
export class MailerModule {}
