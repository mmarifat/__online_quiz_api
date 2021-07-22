import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SystemException } from '../exceptions/system.exception';
import { UserResponseDto } from '../dtos/response/user-response.dto';

@Injectable()
export class TakerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const user = req['_user'] as UserResponseDto;
    const error = { isGuard: true };

    if (!user) {
      throw new SystemException(error);
    }

    if (user.isTaker) {
      return true;
    }

    throw new SystemException(error);
  }
}
