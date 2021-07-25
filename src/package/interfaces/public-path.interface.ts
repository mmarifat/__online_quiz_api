import { RequestMethod } from '@nestjs/common';

export interface PublicPathInterface {
  path: string;
  method: RequestMethod;
}
