import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class PublicInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PublicInterceptor.name);

  async intercept(context: ExecutionContext, next: CallHandler) {
    this.logger.log('Entering to the end-point...');
    return next
      .handle()
      .pipe(tap(() => console.log(`Exiting from the end-point...`)));
  }
}
