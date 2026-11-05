import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageLocaleResolver,
  HeaderLocaleResolver,
  I18nModule,
  JsonI18nLoader,
  QueryLocaleResolver,
} from '@nestjs/i18n';
import { join } from 'node:path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        defaultLocale: 'es',
        supportedLocales: ['es', 'en'],
        loader: new JsonI18nLoader({
          path: join(__dirname),
          watch: config.get<boolean>('env.is_dev'),
        }),
        missingKey: config.get<boolean>('env.is_prd') ? 'fallback' : 'throw',
      }),
      resolvers: [
        new QueryLocaleResolver('lang'),
        new HeaderLocaleResolver('x-lang'),
        new AcceptLanguageLocaleResolver(),
      ],
    }),
  ],
})
export class TranslationModule {}
