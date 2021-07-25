import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalModule } from '../global/global.module';
import QuizTestSchema, {
  QuizTestEntity,
} from '../../package/schemas/quiz/quiz-test.schema';
import { QuizTestController } from './controllers/quiz-test.controller';
import { QuizTestService } from './services/quiz-test.service';
import CollectionEnum from '../../package/enum/collection.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuizTestEntity.name,
        schema: QuizTestSchema,
        collection: CollectionEnum.QUIZ_TEST,
      },
    ]),
    GlobalModule,
  ],
  controllers: [QuizTestController],
  providers: [QuizTestService],
  exports: [QuizTestService],
})
export class QuizTestModule {}
