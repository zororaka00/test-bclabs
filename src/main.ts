import { NestFactory } from '@nestjs/core';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';

import { AppModule } from './app.module';

@Catch(BadRequestException)
export class ValidationExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  public catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest() as any;
    const response = ctx.getResponse();
    const status = request.path == '/login' ? 401 : exception.getStatus();
    const { customMessage } = exception.getResponse() as any;

    response
      .status(status)
      .header('Content-Type', 'application/json; charset=utf-8')
      .json({
        statusCode: status,
        message: customMessage ?? 'Request is fail',
        data: null,
      })
      .end();
  }
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as any;
    const status = exception.getStatus();
    const { customMessage } = exception.getResponse() as any;

    response
      .status(status)
      .header('Content-Type', 'application/json; charset=utf-8')
      .json({
        statusCode: status,
        message: customMessage ?? 'Request is fail',
        data: null,
      })
      .end();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Hypequest')
    .setDescription('Swagger Hypequest')
    .setVersion('1.0')
    .build();
  const options: SwaggerDocumentOptions = {
    deepScanRoutes: true,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  const configService = app.get(ConfigService);
  const apiKeyMoralis = configService.get<string>('API_KEY_MORALIS');
  await Moralis.start({
    apiKey: apiKeyMoralis,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  await app.listen(3000);
}
bootstrap();
