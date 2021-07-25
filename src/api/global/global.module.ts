import { Module } from '@nestjs/common';
import { ResponseService } from '../../package/services/response.service';
import { RequestAppendService } from '../../package/services/request-append.service';
import { ExceptionService } from '../../package/services/exception.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    ResponseService,
    ExceptionService,
    RequestAppendService,
    ConfigService,
  ],
  exports: [
    ResponseService,
    ExceptionService,
    RequestAppendService,
    ConfigService,
  ],
})
export class GlobalModule {}
