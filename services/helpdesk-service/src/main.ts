import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HelpdeskService');

  app.setGlobalPrefix('api');

  // Enable CORS for frontend connectivity
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env['PORT'] ?? 3003;
  await app.listen(port);
  logger.log(`Helpdesk Service running on http://localhost:${port}/api`);
}
bootstrap();

