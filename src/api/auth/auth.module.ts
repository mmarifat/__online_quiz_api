import { Module } from '@nestjs/common';
import { GlobalModule } from '../global/global.module';
import { UserModule } from '../user/user.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { BcryptService } from '../../package/services/bcrypt.service';

@Module({
  imports: [GlobalModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, BcryptService],
  exports: [],
})
export class AuthModule {}
