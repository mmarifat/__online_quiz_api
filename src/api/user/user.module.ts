import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema, { UserEntity } from '../../package/schemas/user/user.schema';
import { GlobalModule } from '../global/global.module';
import RoleSchema, { RoleEntity } from '../../package/schemas/user/role.schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { BcryptService } from '../../package/services/bcrypt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        collection: 'users',
        schema: UserSchema,
      },
      {
        name: RoleEntity.name,
        collection: 'roles',
        schema: RoleSchema,
      },
    ]),
    GlobalModule,
  ],
  controllers: [UserController, RoleController],
  providers: [UserService, RoleService, BcryptService],
  exports: [UserService, RoleService],
})
export class UserModule {}
