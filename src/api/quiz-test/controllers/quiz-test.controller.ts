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
  Query,
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
import { QuizTestService } from '../services/quiz-test.service';
import { QuizTestDto } from '../../../package/dtos/quiz/quiz-test.dto';
import { IntValidationPipe } from '../../../package/pipes/int-validation.pipe';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';

@ApiTags('quiz-test')
@ApiBearerAuth()
@Controller('quiz-test')
export class QuizTestController {
  constructor(
    private quizTestService: QuizTestService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiImplicitQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'order',
    required: false,
    type: Number,
  })
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Paginated Quiz-Tests List',
  })
  @Get('pagination')
  async pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: number,
  ): Promise<ResponseDto> {
    const data = await this.quizTestService.pagination(
      page,
      limit,
      sort,
      order,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      'Paginated Quiz-Tests List',
      page,
      limit,
      data,
    );
  }

  @ApiImplicitQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'order',
    required: false,
    type: Number,
  })
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Paginated Quiz-Tests List by Category',
  })
  @Get('category/pagination')
  async paginationByCategory(
    @Query('category', new ObjectIdValidationPipe()) category: string,
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: number,
  ): Promise<ResponseDto> {
    const data = await this.quizTestService.paginationByCategory(
      category,
      page,
      limit,
      sort,
      order,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      'Paginated Quiz-Tests List by Category',
      page,
      limit,
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: QuizTestDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Quiz-Test Created Successfully',
  })
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    dto: QuizTestDto,
  ): Promise<ResponseDto> {
    const data = await this.quizTestService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Quiz-Test Created Successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: QuizTestDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Quiz-Test Updated successfully',
  })
  @Put(':id')
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true }))
    dto: QuizTestDto,
  ): Promise<ResponseDto> {
    const data = await this.quizTestService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Quiz-Test Updated successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Quiz-Test Deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const data = await this.quizTestService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Quiz-Test Deleted successfully',
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
    const data = await this.quizTestService.findByID(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Single Quiz-Test By ID',
      data,
    );
  }
}
