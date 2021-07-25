import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import { UserEntity } from '../user/user.schema';
import { QuestionEntity } from './question.schema';
import CollectionEnum from '../../enum/collection.enum';
import { CategoryEntity } from './category.schema';

@Schema()
export class QuizTestEntity {
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

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: Number, required: true })
  timeInMin: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.CATEGORY })
  category: CategoryEntity;

  @Prop([
    { type: mongoose.Schema.Types.ObjectId, ref: CollectionEnum.QUESTION },
  ])
  questions: QuestionEntity[];
}

const QuizTestSchema = SchemaFactory.createForClass(QuizTestEntity);

QuizTestSchema.index({ title: 1, category: 1, timeInMin: 1, isDeleted: 1 });
QuizTestSchema.index({ title: 1, timeInMin: 1, isDeleted: 1 });
QuizTestSchema.index({ category: 1, timeInMin: 1, isDeleted: 1 });
QuizTestSchema.index({ title: 1, isDeleted: 1 });
QuizTestSchema.index({ timeInMin: 1, isDeleted: 1 });
QuizTestSchema.index({ category: 1, isDeleted: 1 });
QuizTestSchema.index({ isDeleted: 1 });

QuizTestSchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

export type QuizTestDocument = QuizTestEntity & mongoose.Document;
export default QuizTestSchema;
