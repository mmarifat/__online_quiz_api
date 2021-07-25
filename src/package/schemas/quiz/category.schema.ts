import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import { UserEntity } from '../user/user.schema';
import CollectionEnum from '../../enum/collection.enum';

@Schema()
export class CategoryEntity {
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
  name: string;
}

const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

CategorySchema.index({ name: 1, isDeleted: 1 });
CategorySchema.index({ isDeleted: 1 });

CategorySchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

export type CategoryDocument = CategoryEntity & mongoose.Document;
export default CategorySchema;
