import { BaseDto } from '../core/base.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

export class QuizTestDto extends BaseDto {
  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  readonly title: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString({ message: 'Must be string' })
  readonly description: string;

  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'require field' })
  readonly timeInMin: number;

  @ApiProperty({ type: String, example: 'ObjectID' })
  @IsMongoId()
  @IsNotEmpty({ message: 'require field' })
  readonly category: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: [String], example: ['ObjectID'] })
  @IsMongoId({ each: true })
  @IsNotEmpty({ message: 'require field', each: true })
  readonly questions: mongoose.Schema.Types.ObjectId[];
}
