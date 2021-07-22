import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    const hashPassword = await bcrypt.hash(password, this.saltRounds);
    return Promise.resolve(hashPassword);
  }

  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
  }
}
