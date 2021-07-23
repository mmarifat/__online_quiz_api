import * as mongoose from 'mongoose';
import { GenderEnum } from '../../enum/gender.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleEntity } from './role.schema';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';

@Schema()
export class UserEntity {
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
  fullName: string;

  @Prop({ type: String, default: GenderEnum.MALE, enum: GenderEnum })
  gender: GenderEnum;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  presentAddress: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role: RoleEntity;
}

const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.index({ email: 1 });
UserSchema.index({ email: 1, isDeleted: 1 });
UserSchema.index({ fullName: 1, isDeleted: 1 });
UserSchema.index({ fullName: 1 });
UserSchema.index({ gender: 1 });
UserSchema.index({ gender: 1, isDeleted: 1 });
UserSchema.index({ isDeleted: 1 });

UserSchema.path('email').validate({
  validator: async function (value) {
    const count = await this.model(UserEntity.name).countDocuments({
      email: value,
    });
    return !count;
  },
  message: (props) => {
    return `'${props.value}' already exist`;
  },
});

UserSchema.set('toJSON', {
  transform: (document, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj['password'];
  },
});

export type UserDocument = UserEntity & mongoose.Document;
export default UserSchema;
