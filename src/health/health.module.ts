import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsService } from './metrics.service';
import { HttpMetricsMiddleware } from './http-metrics.middleware';

@Module({
  controllers: [HealthController],
  providers: [MetricsService, HttpMetricsMiddleware],
  exports: [MetricsService, HttpMetricsMiddleware],
})
export class HealthModule {}
