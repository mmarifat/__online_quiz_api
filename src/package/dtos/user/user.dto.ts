import { BaseDto } from '../core/base.dto';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { GenderEnum } from '../../enum/gender.enum';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

export class UserDto extends BaseDto {
  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  @Length(5, 50, { message: 'Length must be from 5 to 20' })
  readonly fullName: string;

  @ApiProperty({
    example: [
      'For male - ' + GenderEnum.MALE,
      'For female - ' + GenderEnum.FEMALE,
      'For other - ' + GenderEnum.OTHER,
    ],
  })
  @IsOptional()
  @IsEnum(GenderEnum, { message: 'Gender must be MALE/FEMALE/OTHER' })
  readonly gender: GenderEnum;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Must be string' })
  @Length(2, 2000, { message: 'Address length must be 20 to 2000' })
  readonly address: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Present Address must be string' })
  @Length(2, 256, {
    message: 'Address field is requied & must be less then 256',
  })
  readonly presentAddress: string;

  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Must be an email' })
  readonly email: string;

  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'Password field is not empty' })
  @MinLength(6, { message: 'Minimum 6 characters' })
  readonly password: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Must be string' })
  @Length(2, 2000, { message: 'length must be [10, 2000]' })
  readonly image: string;

  @ApiProperty({ type: String, example: 'ObjectID' })
  @IsOptional()
  @IsMongoId()
  readonly role: mongoose.Schema.Types.ObjectId;
}
