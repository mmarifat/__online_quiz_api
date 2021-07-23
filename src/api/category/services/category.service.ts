import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemException } from '../../../package/exceptions/system.exception';
import aggregateToVirtualAggregateQuery from '../../../package/queries/aggregate-to-virtual.aggregate.query';
import isNotDeletedQuery from '../../../package/queries/is-not-deleted.query';
import unsetAbstractFieldsAggregateQuery from '../../../package/queries/unset-abstract-fields.aggregate.query';
import { UserDocument } from '../../../package/schemas/user/user.schema';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestAppendService } from '../../../package/services/request-append.service';
import { DeleteDto } from '../../../package/dtos/response/delete.dto';
import { DeleteStatusEnum } from '../../../package/enum/delete-status.enum';
import {
  CategoryDocument,
  CategoryEntity,
} from '../../../package/schemas/quiz/category.schema';
import { CategoryDto } from '../../../package/dtos/quiz/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly exceptionService: ExceptionService,
    private readonly requestAppendService: RequestAppendService,
  ) {}

  findAll = async (): Promise<CategoryEntity[]> => {
    try {
      const data = await this.categoryModel
        .aggregate([
          {
            $match: { ...isNotDeletedQuery },
          },
          ...unsetAbstractFieldsAggregateQuery,
          ...aggregateToVirtualAggregateQuery,
        ])
        .exec();

      this.exceptionService.notFound(data, 'No category found!!');

      return data;
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (dto: CategoryDto): Promise<CategoryEntity> => {
    try {
      const modifiedDto = this.requestAppendService.forCreate(dto);
      return await this.categoryModel.create(modifiedDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  update = async (id: string, dto: CategoryDto): Promise<CategoryEntity> => {
    try {
      const savedDto = await this.findByID(id);

      this.exceptionService.notFound(savedDto, 'Category not found!!');

      const modifiedDto = this.requestAppendService.forUpdate(dto);

      const toBeSaved: UserDocument = <UserDocument>(
        (<unknown>{ ...savedDto, ...modifiedDto })
      );

      await this.categoryModel.updateOne({ _id: id }, toBeSaved);

      return this.findByID(id);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const savedDto = await this.findByID(id);

      this.exceptionService.notFound(savedDto, 'Category not found!!');

      const deleted = await this.categoryModel.updateOne(
        { _id: id },
        {
          isDeleted: DeleteStatusEnum.enabled,
        },
      );

      return new DeleteDto(!!deleted);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByID = async (id: string): Promise<CategoryEntity> => {
    try {
      const pipeline: any[] = [
        {
          $match: { ...isNotDeletedQuery, _id: id },
        },
        ...unsetAbstractFieldsAggregateQuery,
        ...aggregateToVirtualAggregateQuery,
      ];

      const data = await this.categoryModel.aggregate(pipeline).exec();

      this.exceptionService.notFound(data, 'No category found!!');

      return data[0];
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
