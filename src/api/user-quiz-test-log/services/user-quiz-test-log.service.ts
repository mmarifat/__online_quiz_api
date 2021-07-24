import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestAppendService } from '../../../package/services/request-append.service';
import {
  UserQuizTestLogDocument,
  UserQuizTestLogEntity,
} from '../../../package/schemas/quiz/user-quiz-test-log.schema';
import { SystemException } from '../../../package/exceptions/system.exception';
import { UserQuizTestLogDto } from '../../../package/dtos/quiz/user-quiz-test-log.dto';
import { QuizTestService } from '../../quiz-test/services/quiz-test.service';
import { QuizTestEntity } from '../../../package/schemas/quiz/quiz-test.schema';
import { TestAnswerDto } from '../../../package/dtos/quiz/test-answer.dto';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import CollectionEnum from '../../../package/enum/collection.enum';

@Injectable()
export class UserQuizTestLogService {
  constructor(
    @InjectModel(UserQuizTestLogEntity.name)
    private readonly userQuizTestLogModel: Model<UserQuizTestLogDocument>,
    private readonly quizTestService: QuizTestService,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}

  create = async (dto: UserQuizTestLogDto): Promise<UserQuizTestLogEntity> => {
    try {
      if (!dto.quizTest) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Quiz-Test must be defined',
        });
      } else {
        const quiz: QuizTestEntity =
          await this.quizTestService.findByIdWithCorrectAnswer(
            dto.quizTest as any,
          );

        if (quiz.questions.length !== dto.answers.length) {
          throw new SystemException({
            status: HttpStatus.BAD_REQUEST,
            message:
              'quiz-test answers array must be same as quiz-test questions array',
          });
        } else {
          const resultDto = this.generateTestResult(dto, quiz);
          const modifiedDto = this.requestAppendService.forCreate(resultDto);
          return await this.userQuizTestLogModel.create(modifiedDto);
        }
      }
    } catch (error) {
      throw new SystemException(error);
    }
  };

  generateTestResult = (
    dto: UserQuizTestLogDto,
    quiz: QuizTestEntity,
  ): UserQuizTestLogDto => {
    const answers: TestAnswerDto[] = [];

    for (const question of quiz.questions) {
      const questionFromUser = dto.answers.find(
        (f) => f.question === question['id'].toString(),
      );

      console.log(questionFromUser);

      const answerDto = new TestAnswerDto();

      answerDto.answer = questionFromUser.answer;
      answerDto.question = questionFromUser.question;

      answerDto.correct = !!(question.correct === questionFromUser.answer);
      answers.push(answerDto);
    }
    return { ...dto, answers };
  };

  /*findByID = async (id: string): Promise<any> => {
    const pipeline: any[] = [
      {
        $match: { ...isNotDeletedQuery, _id: mongoose.Types.ObjectId(id) },
      },
      ...unsetAbstractFieldsAggregateQuery,
      ...aggregateToVirtualAggregateQuery,
    ];

    pipeline.push({
      $lookup: {
        from: CollectionEnum.QUESTION,
        let: { localID: '$quizTest' },
        pipeline: [
          {
            $match: { $expr: { $in: ['$_id', '$$localID'] } },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ],
        as: 'quizTest',
      },
    });

    pipeline.push({
      $unwind: { path: '$quizTest', preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $lookup: {
        from: CollectionEnum.CATEGORY,
        let: { localID: '$answers.question' },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$_id', '$$localID'] } },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ],
        as: 'answers.question',
      },
    });

    pipeline.push({
      $unwind: { path: '$answers.question', preserveNullAndEmptyArrays: true },
    });

    const testResult = await this.userQuizTestLogModel
      .aggregate(pipeline)
      .exec();
  };*/
}
