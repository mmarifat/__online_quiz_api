import { Module } from '@nestjs/common';
import { FakerService } from './faker.service';
import { configEnvironment } from '../package/env-config/env-config';
import { configMongo } from '../package/mongo-config/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import CategorySchema, {
  CategoryEntity,
} from '../package/schemas/quiz/category.schema';
import QuestionSchema, {
  QuestionEntity,
} from '../package/schemas/quiz/question.schema';
import QuizTestSchema, {
  QuizTestEntity,
} from '../package/schemas/quiz/quiz-test.schema';
import CollectionEnum from '../package/enum/collection.enum';

@Module({
  imports: [
    configEnvironment(),
    configMongo(),
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        schema: CategorySchema,
        collection: CollectionEnum.CATEGORY,
      },
      {
        name: QuestionEntity.name,
        schema: QuestionSchema,
        collection: CollectionEnum.QUESTION,
      },
      {
        name: QuizTestEntity.name,
        schema: QuizTestSchema,
        collection: CollectionEnum.QUIZ_TEST,
      },
    ]),
  ],
  providers: [FakerService],
})
export class FakerModule {}
