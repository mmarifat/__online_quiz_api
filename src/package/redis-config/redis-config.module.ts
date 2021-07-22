import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisEnum } from '../enum/redis.enum';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        config: [
          {
            url: configService.get(RedisEnum.REDIS_SESSION),
            namespace: 'REDIS_SESSION',
          },
          {
            url: configService.get(RedisEnum.REDIS_REGISTER),
            namespace: 'REDIS_REGISTER',
          },
          {
            url: configService.get(RedisEnum.REDIS_PREVENT_DOS_ATT),
            namespace: 'REDIS_PREVENT_DOS_ATT',
          },
          {
            url: configService.get(RedisEnum.REDIS_TMP_FILE),
            namespace: 'REDIS_TMP_FILE',
          },
        ],
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
})
export class RedisConfigModule {}
