import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseService } from '../../../package/services/response.service';
import { ResponseDto } from '../../../package/dtos/response/response.dto';
import { ObjectIdValidationPipe } from '../../../package/pipes/object-id-validation.pipe';
import { SetterGuard } from '../../../package/guards/setter.guard';
import { DtoValidationPipe } from '../../../package/pipes/dto-validation.pipe';
import { CategoryService } from '../services/category.service';
import { CategoryDto } from '../../../package/dtos/quiz/category.dto';

@ApiTags('category')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'All Category List',
  })
  @Get()
  async findAll(): Promise<ResponseDto> {
    const data = await this.categoryService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'All Category List',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CategoryDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Category Created Successfully',
  })
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const data = await this.categoryService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Category Created Successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CategoryDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Category Updated successfully',
  })
  @Put(':id')
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true }))
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const data = await this.categoryService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Category Updated successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Category Deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const data = await this.categoryService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Category Deleted successfully',
      data,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Single Category By ID',
  })
  @Get(':id')
  async findByID(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const data = await this.categoryService.findByID(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Single Category By ID',
      data,
    );
  }
}
