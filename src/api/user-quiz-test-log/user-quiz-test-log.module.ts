import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalModule } from '../global/global.module';
import CollectionEnum from '../../package/enum/collection.enum';
import { UserQuizTestLogService } from './services/user-quiz-test-log.service';
import QuestionSchema, {
  QuestionEntity,
} from '../../package/schemas/quiz/question.schema';
import UserQuizTestLogSchema, {
  UserQuizTestLogEntity,
} from '../../package/schemas/quiz/user-quiz-test-log.schema';
import { UserQuizTestLogController } from './controllers/user-quiz-test-log.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserQuizTestLogEntity.name,
        schema: UserQuizTestLogSchema,
        collection: CollectionEnum.USER_QUIZ_TEST_LOG,
      },
      {
        name: QuestionEntity.name,
        schema: QuestionSchema,
        collection: CollectionEnum.QUESTION,
      },
    ]),
    GlobalModule,
  ],
  controllers: [UserQuizTestLogController],
  providers: [UserQuizTestLogService],
  exports: [UserQuizTestLogService],
})
export class UserQuizTestLogModule {}
