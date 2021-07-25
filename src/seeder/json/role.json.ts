import * as mongoose from 'mongoose';
import { UserTypeEnum } from '../../package/enum/user-type.enum';

export const setterRole = {
  _id: mongoose.Types.ObjectId('setterRoleID'),
  role: UserTypeEnum.SETTER,
};
export const takerRole = {
  _id: mongoose.Types.ObjectId('_takerRoleID'),
  role: UserTypeEnum.TAKER,
};

const roleJson: any[] = [setterRole, takerRole];

export default roleJson;
