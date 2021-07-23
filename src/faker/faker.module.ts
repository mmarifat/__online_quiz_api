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

@Module({
  imports: [
    configEnvironment(),
    configMongo(),
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        schema: CategorySchema,
        collection: 'categories',
      },
      {
        name: QuestionEntity.name,
        schema: QuestionSchema,
        collection: 'questions',
      },
    ]),
  ],
  providers: [FakerService],
})
export class FakerModule {}
