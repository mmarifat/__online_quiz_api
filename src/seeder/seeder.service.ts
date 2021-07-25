import { Injectable, Logger } from '@nestjs/common';
import { BcryptService } from '../package/services/bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import roleJson from './json/role.json';
import { seederUserID, userJson } from './json/user.json';
import { UserDocument, UserEntity } from '../package/schemas/user/user.schema';
import { RoleDocument, RoleEntity } from '../package/schemas/user/role.schema';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(RoleEntity.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly bcryptService: BcryptService,
  ) {}

  async initialize(): Promise<boolean> {
    await this.user();
    await this.role();
    return true;
  }

  /****** user ********/
  user = async (): Promise<boolean> => {
    const mc = await this.userCount();

    if (mc < 1) {
      for (const user of userJson) {
        user.password = await this.bcryptService.hashPassword(user.password);
        user.createdAt = new Date();
        user.updatedAt = new Date();
        user.createdBy = seederUserID;
        user.updatedBy = seederUserID;
        await this.userModel.create(user);
      }
      this.logger.log('User seed done.................');
    } else this.logger.log('User seed already done.................');

    return true;
  };

  userCount = async (): Promise<number> => {
    return this.userModel.estimatedDocumentCount();
  };

  /****** role ********/
  role = async (): Promise<boolean> => {
    const rc = await this.roleCount();

    if (rc < 1) {
      roleJson.map((m) => {
        m.createdAt = new Date();
        m.updatedAt = new Date();
        m.createdBy = seederUserID;
        m.updatedBy = seederUserID;
        return m;
      });
      await this.roleModel.insertMany(roleJson);
      this.logger.log('Role seed done.................');
    } else this.logger.log('Role seed already done.................');

    return true;
  };

  roleCount = async (): Promise<number> => {
    return this.roleModel.estimatedDocumentCount();
  };
}
