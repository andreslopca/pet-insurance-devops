import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method } = req;

    res.on('finish', () => {
      const route = req.route?.path ?? req.path ?? 'unknown';
      const statusCode = String(res.statusCode);
      const durationSeconds = (Date.now() - startTime) / 1000;

      this.metricsService.httpRequestCount.inc({
        method,
        route,
        status_code: statusCode,
      });

      this.metricsService.httpRequestDuration.observe(
        { method, route, status_code: statusCode },
        durationSeconds,
      );
    });

    next();
  }
}
