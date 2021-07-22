import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SystemExceptionFilter } from '../package/filters/system-exception.filter';
import { FieldExceptionFilter } from '../package/filters/field-exception.filter';

async function bootstrap() {
  const logger = new Logger('Quiz Api - Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const appConfig = {
    port: configService.get('QUIZ_SERVICE_PORT'),
    name: configService.get('QUIZ_SERVICE_NAME'),
    url: configService.get('QUIZ_SERVICE_URL'),
  };

  app.setGlobalPrefix('api/v1');

  /********** swagger setup start *************/
  const swaggerOptions = new DocumentBuilder()
    .setContact(
      'Md Minhaz Ahamed Rifat',
      'https://github.com/mmarifat',
      'mma.rifat66@gmail.com',
    )
    .setTitle('Tech Hack Canada - Task - Quiz-API')
    .setDescription('Tech Hack Canada - Task - Quiz-API - documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('quiz-api', app, document);
  /********** swagger setup end *************/

  app.enableCors();

  app.useGlobalFilters(new SystemExceptionFilter());
  app.useGlobalFilters(new FieldExceptionFilter());

  await app.listen(appConfig.port);

  logger.log(`API is running in : http://127.0.0.1:${appConfig.port}`);
  logger.log(
    `API-Documentation is running in : http://127.0.0.1:${appConfig.port}/quiz-api`,
  );
}

bootstrap();
