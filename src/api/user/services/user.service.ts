import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemException } from '../../../package/exceptions/system.exception';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import {
  UserDocument,
  UserEntity,
} from '../../../package/schemas/user/user.schema';
import { ExceptionService } from '../../../package/services/exception.service';
import { UserDto } from '../../../package/dtos/user/user.dto';
import { RequestAppendService } from '../../../package/services/request-append.service';
import { BcryptService } from '../../../package/services/bcrypt.service';
import { DeleteDto } from '../../../package/dtos/response/delete.dto';
import { DeleteStatusEnum } from '../../../package/enum/delete-status.enum';
import CollectionEnum from '../../../package/enum/collection.enum';
import * as mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    private readonly bcryptService: BcryptService,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}

  pagination = async (
    page: number,
    limit: number,
    sort: string,
    order: number,
  ): Promise<[UserEntity[], number]> => {
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
          $sort: { fullName: 1 },
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
          from: CollectionEnum.ROLE,
          let: { localID: '$role' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'role',
        },
      });

      pipeline.push({
        $unwind: { path: '$role', preserveNullAndEmptyArrays: true },
      });

      const paginatedData = await Promise.all([
        this.userModel.aggregate(pipeline).exec(),
        this.userModel
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

  create = async (dto: UserDto): Promise<UserEntity> => {
    try {
      if (!dto?.role) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Role must be defined',
        });
      }
      const modifiedDto = this.requestAppendService.forCreate(dto);

      const customDto: any = {};
      for (const key in modifiedDto) {
        customDto[key] = modifiedDto[key];
      }

      customDto.password = await this.bcryptService.hashPassword(
        modifiedDto.password,
      );

      return await this.userModel.create(customDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  update = async (id: string, dto: UserDto): Promise<UserEntity> => {
    try {
      const savedDto = await this.getByID(id);

      this.exceptionService.notFound(savedDto, 'User not found!!');

      const modifiedDto = this.requestAppendService.forUpdate(dto);

      const customDto: any = {};
      for (const key in modifiedDto) {
        customDto[key] = modifiedDto[key];
      }

      if (dto.password) {
        customDto.password = await this.bcryptService.hashPassword(
          modifiedDto.password,
        );
      }

      const toBeSaved: UserDocument = <UserDocument>(
        (<unknown>{ ...savedDto, ...customDto })
      );

      await this.userModel.updateOne(
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

      this.exceptionService.notFound(savedDto, 'User not found!!');

      const deleted = await this.userModel.updateOne(
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

  findByID = async (id: string): Promise<UserEntity> => {
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
          from: CollectionEnum.ROLE,
          let: { localID: '$role' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'role',
        },
      });

      pipeline.push({
        $unwind: { path: '$role', preserveNullAndEmptyArrays: true },
      });

      const users = await this.userModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(users, 'No user found!!');

      return users[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByEmail = async (email: string): Promise<UserEntity> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, email },
        },
        ...unsetAbstractFieldsAggregateQuery,
      ];

      pipeline.push({
        $lookup: {
          from: CollectionEnum.ROLE,
          let: { localID: '$role' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', '$$localID'] } },
            },
            ...unsetAbstractFieldsAggregateQuery,
            ...aggregateToVirtualAggregateQuery,
          ],
          as: 'role',
        },
      });

      pipeline.push({
        $unwind: { path: '$role', preserveNullAndEmptyArrays: true },
      });

      const users = await this.userModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(users, 'No user found!!');

      return users[0];
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

      const users = await this.userModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(users, 'No user found!!');

      return users[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
