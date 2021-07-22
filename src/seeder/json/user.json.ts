import * as mongoose from 'mongoose';
import { GenderEnum } from '../../package/enum/gender.enum';
import { setterRole, takerRole } from './role.json';

export const seederUserID = mongoose.Types.ObjectId('seederUserID');

export const userJson: any[] = [
  {
    _id: seederUserID,
    fullName: 'Md Minhaz Ahamed',
    email: 'mma.rifat66@gmail.com',
    gender: GenderEnum.MALE,
    image: '',
    address: 'Gazipur City Corporation',
    presentAddress: 'Gazipur City Corporation',
    role: setterRole._id,
    password: '123456',
  },
  {
    fullName: 'Al Amin',
    email: 'alamin@gmail.com',
    gender: GenderEnum.MALE,
    image: '',
    address: 'Uttara 12',
    presentAddress: 'Uttara 12',
    role: takerRole._id,
    password: '123456',
  },
];
