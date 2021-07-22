import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../../../package/services/response.service';
import { AuthService } from '../services/auth.service';
import { DtoValidationPipe } from '../../../package/pipes/dto-validation.pipe';
import { LoginDto } from '../../../package/dtos/auth/login.dto';
import { UserResponseDto } from '../../../package/dtos/response/user-response.dto';
import { UserDto } from '../../../package/dtos/user/user.dto';
import { ResponseDto } from '../../../package/dtos/response/response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Login is successful',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    loginDto: LoginDto,
  ) {
    const payload = await this.authService.login(loginDto);
    return this.responseService.toResponse<UserResponseDto>(
      HttpStatus.OK,
      'Login is successful',
      payload,
    );
  }

  @ApiBody({ type: UserDto })
  @ApiOkResponse({
    status: HttpStatus.CREATED,
    description: 'User Registered Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  async create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      }),
    )
    userDto: UserDto,
  ): Promise<ResponseDto> {
    const user = await this.authService.registration(userDto);

    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'User Registered Successfully',
      user,
    );
  }
}
