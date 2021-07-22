import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Bool } from '../../enum/bool.enum';

export class LoginDto {
  @ApiProperty({ default: 'mma.rifat66@gmail.com' })
  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ default: '123456' })
  @IsDefined({ message: 'Password must be defined' })
  @IsString({ message: 'Password must be a string' })
  password: string;

  @ApiProperty({ default: Bool.Yes })
  @IsInt({ message: 'Must be an integer value' })
  @IsEnum(Bool, { message: 'Can be either 0 or 1' })
  isRemembered: Bool;
}
