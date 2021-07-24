import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemException } from '../../../package/exceptions/system.exception';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import { UserEntity } from '../../../package/schemas/user/user.schema';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestAppendService } from '../../../package/services/request-append.service';
import { DeleteDto } from '../../../package/dtos/response/delete.dto';
import { DeleteStatusEnum } from '../../../package/enum/delete-status.enum';
import {
  QuestionDocument,
  QuestionEntity,
} from '../../../package/schemas/quiz/question.schema';
import { QuestionDto } from '../../../package/dtos/quiz/question.dto';
import CollectionEnum from '../../../package/enum/collection.enum';
import * as mongoose from 'mongoose';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(QuestionEntity.name)
    private readonly questionModel: Model<QuestionDocument>,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}

  random = async (limit: number): Promise<QuestionEntity[]> => {
    try {
      const total = await this.questionModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery },
          },
        ])
        .count('count')
        .exec();

      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery },
        },
        {
          $project: {
            correct: 0,
          },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      if (total.length > 0 && total[0]?.count > 0) {
        pipeline.push({
          $skip: Math.random() * total[0].count,
        });
      }

      if (limit) {
        pipeline.push({
          $limit: Number(limit),
        });
      }

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

      return this.questionModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new SystemException(error);
    }
  };

  randomByCategory = async (
    limit: number,
    category: string,
  ): Promise<QuestionEntity[]> => {
    try {
      const total: any[] = await this.questionModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery, category },
          },
        ])
        .count('count')
        .exec();

      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, category },
        },
        {
          $project: {
            correct: 0,
          },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      if (total.length > 0 && total[0]?.count > 0) {
        pipeline.push({
          $skip: Math.random() * total[0].count,
        });
      }

      if (limit) {
        pipeline.push({
          $limit: limit,
        });
      }

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

      return this.questionModel.aggregate(pipeline).exec();
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (dto: QuestionDto): Promise<QuestionEntity> => {
    try {
      if (!dto?.category) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Category must be defined',
        });
      }
      const modifiedDto = this.requestAppendService.forCreate(dto);

      return await this.questionModel.create(modifiedDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  update = async (id: string, dto: QuestionDto): Promise<QuestionEntity> => {
    try {
      const savedDto = await this.getByID(id);

      this.exceptionService.notFound(savedDto, 'Question not found!!');

      const modifiedDto = this.requestAppendService.forUpdate(dto);

      const toBeSaved: QuestionDocument = <QuestionDocument>(
        (<unknown>{ ...savedDto, ...modifiedDto })
      );

      await this.questionModel.updateOne(
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
      const savedDto = await this.getByID(id);

      this.exceptionService.notFound(savedDto, 'Question not found!!');

      const deleted = await this.questionModel.updateOne(
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

  findByID = async (id: string): Promise<QuestionEntity> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, _id: mongoose.Types.ObjectId(id) },
        },
        {
          $project: {
            correct: 0,
          },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

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

      const data = await this.questionModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(data, 'No question found!!');

      return data[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  // only data
  getByID = async (id: string): Promise<UserEntity> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, _id: mongoose.Types.ObjectId(id) },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      const data = await this.questionModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(data, 'No question found!!');

      return data[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
