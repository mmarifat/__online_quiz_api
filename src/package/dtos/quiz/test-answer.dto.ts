import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class TestAnswerDto {
  @ApiProperty({ type: String, example: 'ObjectID' })
  @IsMongoId()
  @IsNotEmpty({ message: 'require field' })
  readonly question: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @IsString({ message: 'Must be string' })
  @IsNotEmpty({ message: 'require field' })
  readonly answer: string;

  correct: boolean;
}
