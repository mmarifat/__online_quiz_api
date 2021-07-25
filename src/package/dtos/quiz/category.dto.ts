import { BaseDto } from '../core/base.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto extends BaseDto {
  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  @Length(2, 50, { message: 'Length must be from 5 to 20' })
  readonly name: string;
}
