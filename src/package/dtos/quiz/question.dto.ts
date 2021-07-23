import { BaseDto } from '../core/base.dto';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class QuestionDto extends BaseDto {
  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  readonly question: string;

  @ApiProperty({ type: [String] })
  @IsString({ message: 'Must be string', each: true })
  @IsNotEmpty({ message: 'require field', each: true })
  readonly options: string[];

  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  readonly correct: string;

  @ApiProperty({ type: String, example: 'ObjectID' })
  @IsMongoId()
  @IsNotEmpty({ message: 'require field' })
  readonly category: mongoose.Schema.Types.ObjectId;
}
