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
import { UserService } from '../services/user.service';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { IntValidationPipe } from '../../../package/pipes/int-validation.pipe';
import { ResponseDto } from '../../../package/dtos/response/response.dto';
import { ObjectIdValidationPipe } from '../../../package/pipes/object-id-validation.pipe';
import { SetterGuard } from '../../../package/guards/setter.guard';
import { UserDto } from '../../../package/dtos/user/user.dto';
import { DtoValidationPipe } from '../../../package/pipes/dto-validation.pipe';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
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
    description: 'Paginated User List',
  })
  @Get('pagination')
  async pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: number,
  ): Promise<ResponseDto> {
    const users = await this.userService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      'Paginated User List',
      page,
      limit,
      users,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: UserDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'User Created Successfully',
  })
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    dto: UserDto,
  ): Promise<ResponseDto> {
    const user = await this.userService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'User Created Successfully',
      user,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UserDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User Updated successfully',
  })
  @Put(':id')
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true })) dto: UserDto,
  ): Promise<ResponseDto> {
    const user = await this.userService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'User Updated successfully',
      user,
    );
  }

  @UseGuards(new SetterGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User Deleted successfully',
  })
  @Delete(':id')
  async remove(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const user = await this.userService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'User Deleted successfully',
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Single User By ID',
  })
  @Get(':id')
  async findByID(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const role = await this.userService.findByID(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Single User By ID',
      role,
    );
  }
}
