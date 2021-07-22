import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ExceptionService {
  notFound<T>(dto: T | T[], message: string) {
    if (dto instanceof Array) {
      if (dto.length < 1) {
        throw new NotFoundException(message);
      }
    } else {
      if (!dto) {
        throw new NotFoundException(message);
      }
    }
  }
}
