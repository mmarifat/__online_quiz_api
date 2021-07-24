import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestAppendService } from '../../../package/services/request-append.service';
import {
  UserQuizTestLogDocument,
  UserQuizTestLogEntity,
} from '../../../package/schemas/quiz/user-quiz-test-log.schema';

@Injectable()
export class UserQuizTestLogService {
  constructor(
    @InjectModel(UserQuizTestLogEntity.name)
    private readonly userQuizTestLogModel: Model<UserQuizTestLogDocument>,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}
}
