import { Allow } from 'class-validator';
import { DeleteStatusEnum } from '../../enum/delete-status.enum';
import * as mongoose from 'mongoose';

export abstract class BaseDto {
  @Allow()
  _id?: mongoose.Schema.Types.ObjectId;

  @Allow()
  isDeleted?: DeleteStatusEnum;

  @Allow()
  createdBy?: mongoose.Schema.Types.ObjectId;

  @Allow()
  updatedBy?: mongoose.Schema.Types.ObjectId;

  @Allow()
  createdAt?: Date | null;

  @Allow()
  updatedAt?: Date | null;
}
