import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import { UserEntity } from '../user/user.schema';
import { CategoryEntity } from './category.schema';

@Schema()
export class QuestionEntity {
  @Prop({
    type: Number,
    enum: DeleteStatusEnum,
    required: true,
    default: DeleteStatusEnum.disabled,
  })
  isDeleted: DeleteStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
  createdBy: UserEntity;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users' })
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
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: String, required: true })
  correct: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'categories' })
  category: CategoryEntity;
}

const QuestionSchema = SchemaFactory.createForClass(QuestionEntity);

QuestionSchema.index({ question: 1, category: 1, isDeleted: 1 });
QuestionSchema.index({ category: 1, isDeleted: 1 });
QuestionSchema.index({ question: 1, isDeleted: 1 });
QuestionSchema.index({ isDeleted: 1 });

QuestionSchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

export type QuestionDocument = QuestionEntity & mongoose.Document;
export default QuestionSchema;
