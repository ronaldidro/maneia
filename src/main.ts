import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { ErrorsInterceptor } from '@/interceptor/errors.interceptor';
import { registerBullBoard } from '@/bull-board';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const isDevEnv = configService.get<string>('env') === 'dev';
  const clientUrl = configService.get<string>('client.url');
  const origin = isDevEnv ? '*' : clientUrl;

  app.enableCors({ origin });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
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

  app.useGlobalInterceptors(
    new ErrorsInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.setGlobalPrefix('api');

  registerBullBoard(app, ['mailer'], configService);

  await app.listen(configService.get<number>('port') ?? 3000);
}

void bootstrap();
