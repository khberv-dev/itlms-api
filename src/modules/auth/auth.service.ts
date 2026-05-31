import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';

import { UserService } from '../user/user.service';
import { JwtTokenService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async validateUserByLoginPassword(phone: string, password: string) {
    const user = await this.userService.findByPhone(phone);

    if (!user) {
      throw new BadRequestException('Invalid phone.');
    }

    const is_password_same = await this.comparePasswordWithHash(password, user?.password);

    if (!is_password_same) {
      throw new BadRequestException('Invalid password');
    }

    user.password = null;

    return user;
  }

  async validateUserById(user_id: string, role: string) {
    const user = await this.userService.getMe(user_id, role).catch(() => {
      throw new BadRequestException('Valid token with non-existent user.');
    });

    return user;
  }

  async comparePasswordWithHash(password, hash) {
    const is_same = await bcrypt.compare(password, hash);
    return is_same;
  }

  getJWT(type: 'access' | 'refresh', sub: string, role) {
    return this.jwtTokenService.getJWT(type, sub, role);
  }
}
