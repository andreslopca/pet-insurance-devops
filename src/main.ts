import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MetricsService } from './health/metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  // Initialize default Prometheus metrics collection
  const metricsService = app.get(MetricsService);
  metricsService.initDefaultMetrics();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Pet Insurance API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Prometheus metrics: http://localhost:${port}/metrics`);
}

bootstrap();
