import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import { UserEntity } from '../user/user.schema';
import CollectionEnum from '../../enum/collection.enum';
import { QuizTestEntity } from './quiz-test.schema';
import { TestAnswerDto } from '../../dtos/quiz/test-answer.dto';
import { QuestionEntity } from './question.schema';

@Schema()
export class TestAnswerEntity extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.QUESTION })
  question: QuestionEntity;

  @Prop({ type: String, required: true })
  answer: string;

  @Prop({ type: Boolean, required: false })
  correct: string;
}
export const TestAnswerSchema = SchemaFactory.createForClass(TestAnswerEntity);

@Schema()
export class UserQuizTestLogEntity {
  @Prop({
    type: Number,
    enum: DeleteStatusEnum,
    required: true,
    default: DeleteStatusEnum.disabled,
  })
  isDeleted: DeleteStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.USER })
  createdBy: UserEntity;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.USER })
  updatedBy: UserEntity;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;

  @Prop({ type: [TestAnswerSchema], required: true })
  answers: TestAnswerDto[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.QUIZ_TEST })
  quizTest: QuizTestEntity;
}

const UserQuizTestLogSchema = SchemaFactory.createForClass(
  UserQuizTestLogEntity,
);

UserQuizTestLogSchema.index({ createdBy: 1, isDeleted: 1 });
UserQuizTestLogSchema.index({ isDeleted: 1 });

UserQuizTestLogSchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

export type UserQuizTestLogDocument = UserQuizTestLogEntity & mongoose.Document;
export default UserQuizTestLogSchema;
