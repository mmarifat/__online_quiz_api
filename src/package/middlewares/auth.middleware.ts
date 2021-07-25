import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { SystemErrorDto } from '../dtos/response/system-error.dto';
import { ErrorDto } from '../dtos/response/error.dto';
import { ResponseDto } from '../dtos/response/response.dto';
import { RedisEnum } from '../enum/redis.enum';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private redisSession: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redisSession = this.redisService.getClient(RedisEnum.REDIS_SESSION);
  }

  private static toResponse(res: Response, message: string): Response {
    const systemErrorDto = new SystemErrorDto('UNAUTHORIZED', 'Error', message);
    const errorDto = new ErrorDto(null, systemErrorDto);

    const responseDto = new ResponseDto(
      new Date().getTime(),
      HttpStatus.UNAUTHORIZED,
      message,
      errorDto,
      null,
    );

    return res.json(responseDto);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers['authorization']?.split('Bearer ')[1];

      if (!token) {
        return AuthMiddleware.toResponse(res, 'Token is not found in request');
      }

      // set to default if fallback
      let expireTime = this.configService.get(RedisEnum.TOKEN_EXPIRE_TIME);
      let tokenExpireTime = 5000;

      const privateKEY = this.configService
        .get('PRIVATE_KEY')
        .replace(/\\n/g, '\n');

      jwt.verify(
        token,
        privateKEY,
        {
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) return AuthMiddleware.toResponse(res, 'Session expired!!');
          else {
            const token: any = decoded;
            expireTime = token.exp - token.iat;
          }
        },
      );

      await this.redisSession.expire(token, expireTime).then((res) => {
        tokenExpireTime = res;
      });

      if (tokenExpireTime <= 0) {
        return AuthMiddleware.toResponse(
          res,
          'Session expired due to inactivity',
        );
      }

      next();
    } catch (error) {
      return AuthMiddleware.toResponse(res, 'Authorization is denied');
    }
  }
}
