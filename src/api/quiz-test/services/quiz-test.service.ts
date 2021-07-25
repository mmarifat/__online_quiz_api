import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { SystemException } from '../../../package/exceptions/system.exception';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestAppendService } from '../../../package/services/request-append.service';
import { DeleteDto } from '../../../package/dtos/response/delete.dto';
import { DeleteStatusEnum } from '../../../package/enum/delete-status.enum';
import {
  QuizTestDocument,
  QuizTestEntity,
} from '../../../package/schemas/quiz/quiz-test.schema';
import { QuizTestDto } from '../../../package/dtos/quiz/quiz-test.dto';
import CollectionEnum from '../../../package/enum/collection.enum';

@Injectable()
export class QuizTestService {
  constructor(
    @InjectModel(QuizTestEntity.name)
    private readonly quizTestModel: Model<QuizTestDocument>,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}

  pagination = async (
    page: number,
    limit: number,
    sort: string,
    order: number,
  ): Promise<[QuizTestEntity[], number]> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      if (sort && sort !== 'undefined') {
        if (order) {
          if ([1, -1].includes(Number(order))) {
            pipeline.push({
              $sort: { [sort]: Number(order) },
            });
          } else {
            pipeline.push({
              $sort: { [sort]: 1 },
            });
          }
        } else {
          pipeline.push({
            $sort: { [sort]: 1 },
          });
        }
      } else {
        pipeline.push({
          $sort: { title: 1 },
        });
      }

      if (page && limit) {
        pipeline.push({
          $skip: page - 1,
        });
        pipeline.push({
          $limit: limit,
        });
      }

      pipeline.push({
        $lookup: {
          from: CollectionEnum.QUESTION,
          let: { localID: '$questions' },
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$localID'] } },
            },
            {
              $project: {
                correct: 0,
                category: 0,
              },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'questions',
        },
      });

      pipeline.push({
        $lookup: {
          from: CollectionEnum.CATEGORY,
          let: { localID: '$category' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'category',
        },
      });

      pipeline.push({
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
      });

      const paginatedData = await Promise.all([
        this.quizTestModel.aggregate(pipeline).exec(),
        this.quizTestModel
          .aggregate([
            {
              $match: { ...isNotDeletedQuery },
            },
          ])
          .count('count')
          .exec(),
      ]);

      return [
        paginatedData[0],
        paginatedData[1].length ? paginatedData[1][0]?.count : 0,
      ];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  paginationByCategory = async (
    category: string,
    page: number,
    limit: number,
    sort: string,
    order: number,
  ): Promise<[QuizTestEntity[], number]> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, category },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      if (sort && sort !== 'undefined') {
        if (order) {
          if ([1, -1].includes(Number(order))) {
            pipeline.push({
              $sort: { [sort]: Number(order) },
            });
          } else {
            pipeline.push({
              $sort: { [sort]: 1 },
            });
          }
        } else {
          pipeline.push({
            $sort: { [sort]: 1 },
          });
        }
      } else {
        pipeline.push({
          $sort: { title: 1 },
        });
      }

      if (page && limit) {
        pipeline.push({
          $skip: page - 1,
        });
        pipeline.push({
          $limit: limit,
        });
      }

      pipeline.push({
        $lookup: {
          from: CollectionEnum.QUESTION,
          let: { localID: '$questions' },
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$localID'] } },
            },
            {
              $project: {
                correct: 0,
                category: 0,
              },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'questions',
        },
      });

      pipeline.push({
        $lookup: {
          from: CollectionEnum.CATEGORY,
          let: { localID: '$category' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'category',
        },
      });

      pipeline.push({
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
      });

      const paginatedData = await Promise.all([
        this.quizTestModel.aggregate(pipeline).exec(),
        this.quizTestModel
          .aggregate([
            {
              $match: { ...isNotDeletedQuery, category },
            },
          ])
          .count('count')
          .exec(),
      ]);
      return [
        paginatedData[0],
        paginatedData[1].length ? paginatedData[1][0]?.count : 0,
      ];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (dto: QuizTestDto): Promise<QuizTestEntity> => {
    try {
      if (!dto.category) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Category must be defined',
        });
      }
      if (dto.questions.length < 1) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'At least one question must be defined',
        });
      }

      const modifiedDto = this.requestAppendService.forCreate(dto);
      return await this.quizTestModel.create(modifiedDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  update = async (id: string, dto: QuizTestDto): Promise<QuizTestEntity> => {
    try {
      const savedDto = await this.findByID(id);

      this.exceptionService.notFound(savedDto, 'Quiz-test not found!!');

      const modifiedDto = this.requestAppendService.forUpdate(dto);

      const toBeSaved: QuizTestDocument = <QuizTestDocument>(
        (<unknown>{ ...savedDto, ...modifiedDto })
      );

      await this.quizTestModel.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        toBeSaved,
      );

      return this.findByID(id);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const savedDto = await this.findByID(id);

      this.exceptionService.notFound(savedDto, 'Quiz-test not found!!');

      const deleted = await this.quizTestModel.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          isDeleted: DeleteStatusEnum.enabled,
        },
      );

      return new DeleteDto(!!deleted);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByID = async (id: string): Promise<QuizTestEntity> => {
    try {
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
          let: { localID: '$questions' },
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$localID'] } },
            },
            {
              $project: {
                correct: 0,
                category: 0,
              },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'questions',
        },
      });

      pipeline.push({
        $lookup: {
          from: CollectionEnum.CATEGORY,
          let: { localID: '$category' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'category',
        },
      });

      pipeline.push({
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
      });

      const data = await this.quizTestModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(data, 'No quiz-test found!!');

      return data[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  // used by result checker
  findByIdWithCorrectAnswer = async (id: string): Promise<QuizTestEntity> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, _id: mongoose.Types.ObjectId(id) },
        },
        {
          $project: {
            category: 0,
          },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      pipeline.push({
        $lookup: {
          from: CollectionEnum.QUESTION,
          let: { localID: '$questions' },
          pipeline: [
            {
              $match: { $expr: { $in: ['$_id', '$$localID'] } },
            },
            {
              $project: {
                category: 0,
              },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'questions',
        },
      });

      const data = await this.quizTestModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(data, 'No quiz-test found!!');

      return data[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
