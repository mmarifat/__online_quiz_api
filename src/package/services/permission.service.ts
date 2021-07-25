import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserResponseDto } from '../dtos/response/user-response.dto';

@Injectable()
export class PermissionService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  returnRequest = (): UserResponseDto => {
    return this.request['_user'] as UserResponseDto;
  };

  taker = (): {
    userID: string;
    status: boolean;
  } => {
    const user: UserResponseDto = this.request['_user'] as UserResponseDto;
    if (user) {
      if (user.isTaker) {
        return {
          userID: user.userID,
          status: true,
        };
      }
    }
    return {
      userID: null,
      status: false,
    };
  };

  setter = (): {
    userID: string;
    status: boolean;
  } => {
    const user: UserResponseDto = this.request['_user'] as UserResponseDto;
    if (user) {
      if (user.isSetter) {
        return {
          userID: user.userID,
          status: true,
        };
      }
    }
    return {
      userID: null,
      status: false,
    };
  };
}
