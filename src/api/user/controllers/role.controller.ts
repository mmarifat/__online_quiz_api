import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../../../package/services/response.service';
import { ResponseDto } from '../../../package/dtos/response/response.dto';
import { RoleService } from '../services/role.service';
import { ObjectIdValidationPipe } from '../../../package/pipes/object-id-validation.pipe';

@ApiTags('role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(
    private roleService: RoleService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'All Role List',
  })
  @Get()
  async findAll(): Promise<ResponseDto> {
    const roles = await this.roleService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'All Role List',
      roles,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Single Role By ID',
  })
  @Get(':id')
  async findByID(
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const role = await this.roleService.findByID(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Single Role By ID',
      role,
    );
  }
}
