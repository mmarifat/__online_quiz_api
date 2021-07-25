import { BaseDto } from '../core/base.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RoleDto extends BaseDto {
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  @Length(5, 50, { message: 'Length must be from 5 to 20' })
  readonly role: string;
}
