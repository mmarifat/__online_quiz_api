import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import { UserEntity } from './user.schema';

@Schema()
export class RoleEntity {
  @Prop({
    type: Number,
    enum: DeleteStatusEnum,
    required: true,
    default: DeleteStatusEnum.disabled,
  })
  isDeleted: DeleteStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: UserEntity;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
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
  role: string;
}

const RoleSchema = SchemaFactory.createForClass(RoleEntity);

RoleSchema.index({ role: 1, isDeleted: 1 });
RoleSchema.index({ role: 1 });
RoleSchema.index({ isDeleted: 1 });

RoleSchema.path('role').validate({
  validator: async function (value) {
    const count = await this.model(RoleEntity.name).countDocuments({
      role: value,
    });
    return !count;
  },
  message: (props) => {
    return `'${props.value}' already exist`;
  },
});

RoleSchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

export type RoleDocument = RoleEntity & mongoose.Document;
export default RoleSchema;
