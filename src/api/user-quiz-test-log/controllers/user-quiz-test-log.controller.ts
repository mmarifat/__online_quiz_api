import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseService } from '../../../package/services/response.service';
import { UserQuizTestLogService } from '../services/user-quiz-test-log.service';
import { DtoValidationPipe } from '../../../package/pipes/dto-validation.pipe';
import { ResponseDto } from '../../../package/dtos/response/response.dto';
import { TakerGuard } from '../../../package/guards/taker.guard';
import { UserQuizTestLogDto } from '../../../package/dtos/quiz/user-quiz-test-log.dto';

@ApiTags('user-quiz-test')
@ApiBearerAuth()
@Controller('user-quiz-test')
export class UserQuizTestLogController {
  constructor(
    private userQuizTestLogService: UserQuizTestLogService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(new TakerGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: UserQuizTestLogDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'User-Quiz-Test attended successfully',
  })
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    dto: UserQuizTestLogDto,
  ): Promise<ResponseDto> {
    const data = await this.userQuizTestLogService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'User-Quiz-Test attended successfully',
      data,
    );
  }
}
