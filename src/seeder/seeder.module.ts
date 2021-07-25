import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { configEnvironment } from '../package/env-config/env-config';
import { configMongo } from '../package/mongo-config/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema, { UserEntity } from '../package/schemas/user/user.schema';
import RoleSchema, { RoleEntity } from '../package/schemas/user/role.schema';
import { BcryptService } from '../package/services/bcrypt.service';
import CollectionEnum from '../package/enum/collection.enum';

@Module({
  imports: [
    configEnvironment(),
    configMongo(),
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
        collection: CollectionEnum.USER,
      },
      {
        name: RoleEntity.name,
        schema: RoleSchema,
        collection: CollectionEnum.ROLE,
      },
    ]),
  ],
  providers: [SeederService, BcryptService],
})
export class SeederModule {}
