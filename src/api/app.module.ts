import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { configEnvironment } from '../package/env-config/env-config';
import { configRedis } from '../package/redis-config/redis.config';
import { PublicMiddleware } from '../package/middlewares/public.middleware';
import { configMongo } from '../package/mongo-config/mongo.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from '../package/middlewares/auth.middleware';
import { publicUrls } from './public.url';

@Module({
  imports: [
    configEnvironment(),
    configRedis(),
    configMongo(),
    AuthModule,
    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicMiddleware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(...publicUrls)
      .forRoutes('*');
  }
}
