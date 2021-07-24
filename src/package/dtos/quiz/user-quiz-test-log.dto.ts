import { BaseDto } from '../core/base.dto';
import { IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { TestAnswerDto } from './test-answer.dto';

export class UserQuizTestLogDto extends BaseDto {
  @ApiProperty({ type: String, example: 'ObjectID' })
  @IsMongoId()
  @IsNotEmpty({ message: 'require field' })
  readonly quizTest: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: [TestAnswerDto] })
  @ValidateNested({ each: true })
  readonly answers: TestAnswerDto[];
}
