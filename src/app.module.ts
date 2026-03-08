import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { PetsModule } from './pets/pets.module';
import { PoliciesModule } from './policies/policies.module';
import { HealthModule } from './health/health.module';
import { HttpMetricsMiddleware } from './health/http-metrics.middleware';

@Module({
  imports: [
    AuthModule,
    CustomersModule,
    PetsModule,
    PoliciesModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*');
  }
}
