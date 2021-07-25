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
      const modifiedDto = this.requestAppendService.forCreate(dto);

      const alreadyDne = await this.findByQuizAndUser(
        modifiedDto.quizTest.toString(),
        modifiedDto.createdBy.toString(),
      );

      if (alreadyDne) {
        throw new SystemException({
          status: HttpStatus.CONFLICT,
          message: 'User already attended in this quiz test',
        });
      }
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
          const resultDto = this.generateTestResult(modifiedDto, quiz);
          await this.userQuizTestLogModel.create(resultDto);

          return this.findByQuizAndUser(
            resultDto.quizTest.toString(),
            resultDto.createdBy.toString(),
          );
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

      if (!questionFromUser) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message:
            'quiz-test answers array must be same as quiz-test questions array',
        });
      }

      const answerDto = new TestAnswerDto();

      answerDto.answer = questionFromUser.answer;
      answerDto.question = questionFromUser.question;

      answerDto.correct = !!(question.correct === questionFromUser.answer);
      answers.push(answerDto);
    }
    return { ...dto, answers };
  };

  findByQuizAndUser = async (
    quizID: string,
    userID: string,
  ): Promise<UserQuizTestLogEntity | null> => {
    const pipeline: any[] = [
      {
        $match: {
          ...isNotDeletedQuery,
          quizTest: mongoose.Types.ObjectId(quizID),
          createdBy: mongoose.Types.ObjectId(userID),
        },
      },
    ];

    // lookup questions from answers array
    pipeline.push(
      {
        $unwind: { path: '$answers', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: CollectionEnum.QUESTION,
          let: { localID: '$answers.question' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            {
              $project: {
                question: 1,
              },
            },
          ],
          as: 'answers.question',
        },
      },
      {
        $unwind: {
          path: '$answers.question',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'answers.question': '$answers.question.question',
        },
      },
      {
        $unset: ['answers._id'],
      },
    );

    // group by id to make array of answers
    pipeline.push({
      $group: {
        _id: '$_id',
        answerResult: {
          $push: '$answers',
        },
      },
    });

    // re-mapping with array lookup
    pipeline.push(
      {
        $lookup: {
          from: CollectionEnum.USER_QUIZ_TEST_LOG,
          let: { localID: '$_id' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'new',
        },
      },
      {
        $unwind: { path: '$new', preserveNullAndEmptyArrays: true },
      },
      // added result count
      {
        $addFields: {
          'new.answers': '$answerResult',
          'new.result.correct': {
            $size: {
              $filter: {
                input: '$answerResult',
                as: 'ans',
                cond: { $eq: ['$$ans.correct', true] },
              },
            },
          },
          'new.result.incorrect': {
            $size: {
              $filter: {
                input: '$answerResult',
                as: 'ans',
                cond: { $eq: ['$$ans.correct', false] },
              },
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$new',
        },
      },
    );

    // lookup in quizTest
    pipeline.push(
      {
        $lookup: {
          from: CollectionEnum.QUIZ_TEST,
          let: { localID: '$quizTest' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
            {
              $project: {
                title: 1,
                description: 1,
                timeInMin: 1,
              },
            },
          ],
          as: 'quizTest',
        },
      },
      {
        $unwind: { path: '$quizTest', preserveNullAndEmptyArrays: true },
      },
    );

    // lookup in createdBy
    pipeline.push(
      {
        $lookup: {
          from: CollectionEnum.USER,
          let: { localID: '$createdBy' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
            {
              $project: {
                fullName: 1,
                image: 1,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
    );

    pipeline.push(
      {
        $addFields: {
          date: '$createdAt',
        },
      },
      ...unsetAbstractFieldsAggregateQuery,
    );

    const data = await this.userQuizTestLogModel.aggregate(pipeline).exec();

    return data.length ? data[0] : null;
  };
}
