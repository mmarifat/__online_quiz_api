import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SystemException } from '../exceptions/system.exception';
import { UserResponseDto } from '../dtos/response/user-response.dto';

@Injectable()
export class SetterGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const error = { isGuard: true };

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const user = req['_user'] as UserResponseDto;

    if (!user) {
      throw new SystemException(error);
    }

    if (user.isSetter) {
      return true;
    }
    throw new SystemException(error);
  }
}
