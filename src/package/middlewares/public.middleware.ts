import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { RedisEnum } from '../enum/redis.enum';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class PublicMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PublicMiddleware.name);

  private redisSession: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redisSession = this.redisService.getClient(RedisEnum.REDIS_SESSION);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['authorization']?.split('Bearer ')[1];

      if (token) {
        const payload = await this.redisSession.get(token);
        if (payload) req['_user'] = JSON.parse(payload);
      }
      next();
    } catch (error) {
      this.logger.log(error);
    }
  }
}
