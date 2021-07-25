import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseDto } from '../dtos/core/base.dto';

@Injectable()
export class RequestAppendService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  forCreate<T extends BaseDto>(dto: T): T {
    if (dto) {
      dto.createdAt = new Date();
      dto.createdBy = this.request['_user']?.userID || null;

      dto.updatedAt = new Date();
      dto.updatedBy = dto.createdBy;

      return dto;
    } else {
      throw new NotFoundException('No data specified!');
    }
  }

  forUpdate<T extends BaseDto>(dto: T): T {
    if (dto) {
      dto.updatedAt = new Date();
      dto.updatedBy = this.request['_user']?.userID || null;

      return dto;
    } else {
      throw new NotFoundException('No data specified!');
    }
  }
}
