import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalModule } from '../global/global.module';
import CategorySchema, {
  CategoryEntity,
} from '../../package/schemas/quiz/category.schema';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CategoryEntity.name,
        collection: 'categories',
        schema: CategorySchema,
      },
    ]),
    GlobalModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
