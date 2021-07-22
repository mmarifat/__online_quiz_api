import { PublicPathInterface } from '../package/interfaces/public-path.interface';
import { RequestMethod } from '@nestjs/common';

export const publicUrls: Array<PublicPathInterface> = [
  { path: '/api/v1/auth/login', method: RequestMethod.POST },
  { path: '/api/v1/auth/registration', method: RequestMethod.POST },
];
