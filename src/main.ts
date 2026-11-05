import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nValidationPipe } from '@nestjs/i18n';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { registerBullBoard } from '@/bull-board';
import { HttpExceptionFilter } from '@/filter/http-exception.filter';
import { ObserveInstrument } from '@/observer/observer.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService);

  const isDevEnv = configService.get<boolean>('env.is_dev');
  const clientUrl = configService.get<string>('client.url');
  const origin = isDevEnv ? '*' : clientUrl;

  app.enableCors({ origin });

  app.use(helmet());

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MANEIA API')
    .setDescription('The shared expenses API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  registerBullBoard(app, ['mailer'], configService);

  await app.listen(configService.get<number>('port') ?? 3000);
}

void bootstrap();
