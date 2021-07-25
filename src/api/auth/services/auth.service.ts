import { HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { UserResponseDto } from '../../../package/dtos/response/user-response.dto';
import { LoginDto } from '../../../package/dtos/auth/login.dto';
import { UserEntity } from '../../../package/schemas/user/user.schema';
import { SystemException } from '../../../package/exceptions/system.exception';
import { BcryptService } from '../../../package/services/bcrypt.service';
import { RedisEnum } from '../../../package/enum/redis.enum';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { UserTypeEnum } from '../../../package/enum/user-type.enum';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { UserDto } from '../../../package/dtos/user/user.dto';
import { RoleService } from '../../user/services/role.service';

@Injectable()
export class AuthService {
  private redisSession: Redis;

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redisSession = this.redisService.getClient(RedisEnum.REDIS_SESSION);
  }

  login = async (loginDto: LoginDto): Promise<UserResponseDto> => {
    try {
      const user = await this.validateUser(loginDto);
      const userResponseDto = this.generatePayload(user);
      const accessToken = this.generateToken(userResponseDto, loginDto);

      await this.redisSession.set(accessToken, JSON.stringify(userResponseDto));

      userResponseDto.accessToken = accessToken;

      return Promise.resolve(userResponseDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  validateUser = async (loginDto: LoginDto): Promise<UserEntity> => {
    try {
      const user: UserEntity = await this.userService.findByEmail(
        loginDto.email,
      );

      const isPasswordMatched = await this.bcryptService.comparePassword(
        loginDto.password,
        user?.password,
      );

      if (!isPasswordMatched) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User password is not valid',
        });
      }
      return user;
    } catch (error) {
      throw new SystemException(error);
    }
  };

  generatePayload = (user: UserEntity): UserResponseDto => {
    const userResponseDto = new UserResponseDto();

    userResponseDto.userID = user['_id'];
    userResponseDto.email = user.email;
    userResponseDto.name = user.fullName;
    userResponseDto.isSetter = !!(user.role.role === UserTypeEnum.SETTER);
    userResponseDto.isTaker = !!(user.role.role === UserTypeEnum.TAKER);

    return userResponseDto;
  };

  generateToken = (payload: UserResponseDto, loginDto: LoginDto): string => {
    const privateKEY = this.configService
      .get('PRIVATE_KEY')
      .replace(/\\n/g, '\n');

    let accessToken;

    if (loginDto.isRemembered === 1) {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '365d',
        algorithm: 'RS256',
      });
    } else {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '1h',
        algorithm: 'RS256',
      });
    }

    return accessToken;
  };

  /********** registration *******/
  registration = async (userDto: UserDto): Promise<UserEntity> => {
    try {
      const takerRole = await this.roleService.findByRole(UserTypeEnum.TAKER);

      const customDto: any = {};
      for (const key in userDto) {
        customDto[key] = userDto[key];
      }
      customDto.role = takerRole['id'];

      return await this.userService.create(customDto);
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
