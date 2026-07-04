import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ErrorsInterceptor } from '@/interceptor/errors.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({ origin: [configService.get<string>('client_url')] });

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

  await app.listen(configService.get<number>('port') ?? 3000);
}
bootstrap();
