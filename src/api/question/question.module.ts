import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalModule } from '../global/global.module';
import { QuestionService } from './services/question.service';
import { QuestionController } from './controllers/question.controller';
import QuestionSchema, {
  QuestionEntity,
} from '../../package/schemas/quiz/question.schema';
import CollectionEnum from '../../package/enum/collection.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: QuestionEntity.name,
        schema: QuestionSchema,
        collection: CollectionEnum.QUESTION,
      },
    ]),
    GlobalModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
