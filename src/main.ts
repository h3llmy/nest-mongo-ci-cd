import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './utils/httpExceptionHandler';
import helmet from 'helmet';
import { ValidationErrorHandler } from './utils/validationErrorHandler';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const routePrefix: string = 'api/v1';
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix(routePrefix);

  app.use(helmet());
  app.enableCors();

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalPipes(new ValidationErrorHandler());
  app.useGlobalFilters(new ExceptionsFilter(httpAdapter));

  const options = new DocumentBuilder()
    .setTitle('Api Documentation')
    .setDescription('API Boilerplate Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${routePrefix}/docs`, app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
