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
import { IntValidationPipe } from '../../../package/pipes/int-validation.pipe';
import { ResponseDto } from '../../../package/dtos/response/response.dto';
import { ObjectIdValidationPipe } from '../../../package/pipes/object-id-validation.pipe';
import { SetterGuard } from '../../../package/guards/setter.guard';
import { DtoValidationPipe } from '../../../package/pipes/dto-validation.pipe';
import { QuestionService } from '../services/question.service';
import { QuestionDto } from '../../../package/dtos/quiz/question.dto';

@ApiTags('question')
@ApiBearerAuth()
@Controller('question')
export class QuestionController {
  constructor(
    private questionService: QuestionService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Random Questions List',
  })
  @Get('random')
  async pagination(
    @Query('limit', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const data = await this.questionService.random(limit);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'Random Questions List',
      data,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Random Questions By Category',
  })
  @Get('random/category')
  async findByCategory(
    @Query('category', new ObjectIdValidationPipe()) category: string,
    @Query('limit', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const data = await this.questionService.randomByCategory(limit, category);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'Random Questions By Category',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: QuestionDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Question Created Successfully',
  })
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    dto: QuestionDto,
  ): Promise<ResponseDto> {
    const data = await this.questionService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Question Created Successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: QuestionDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Question Updated successfully',
  })
  @Put(':id')
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true }))
    dto: QuestionDto,
  ): Promise<ResponseDto> {
    const data = await this.questionService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Question Updated successfully',
      data,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Question Deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const data = await this.questionService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Question Deleted successfully',
      data,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Single Question By ID',
  })
  @Get(':id')
  async findByID(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const data = await this.questionService.findByID(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Single Question By ID',
      data,
    );
  }
}
