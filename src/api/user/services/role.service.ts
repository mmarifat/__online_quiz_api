import { Injectable } from '@nestjs/common';
import { ExceptionService } from '../../../package/services/exception.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemException } from '../../../package/exceptions/system.exception';
import {
  RoleDocument,
  RoleEntity,
} from '../../../package/schemas/user/role.schema';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import { UserTypeEnum } from '../../../package/enum/user-type.enum';
import * as mongoose from 'mongoose';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleEntity.name)
    private roleModel: Model<RoleDocument>,
    private readonly exceptionService: ExceptionService,
  ) {}

  findAll = async (): Promise<RoleEntity[]> => {
    try {
      const roles = await this.roleModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ])
        .exec();

      this.exceptionService.notFound(roles, 'No roles found!!');

      return roles;
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByID = async (id: string): Promise<RoleEntity> => {
    try {
      const roles = await this.roleModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery, _id: mongoose.Types.ObjectId(id) },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ])
        .exec();

      this.exceptionService.notFound(roles, 'No role found!!');

      return roles[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByRole = async (role: UserTypeEnum): Promise<RoleEntity> => {
    try {
      const roles = await this.roleModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery, role },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ])
        .exec();

      this.exceptionService.notFound(roles, 'No role found!!');

      return roles[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
