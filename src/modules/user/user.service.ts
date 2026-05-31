import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { generatePassword, hashPassword } from 'src/common/helpers';
import { UserRepository } from './user.repository';
import { mapRole } from './helpers/role-map';
import ChangeUserPasswordDto from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data) {
    const existing_user = await this.userRepository.isExist({
      phone: data.phone,
    });

    if (existing_user) {
      throw new BadRequestException('Phone already taken');
    }

    const generated_password = generatePassword(10);

    const password = await hashPassword(generated_password);

    const user = await this.userRepository.create({ ...data, password });
    return { ...user, password: generated_password };
  }

  async findByPhone(phone: string) {
    const user = await this.userRepository.findByPhone(phone);
    if (user) {
      const data = user[mapRole(user.role as any)] as Object;
      delete user[mapRole(user.role as any)];
      return { ...user, ...data };
    } else {
      return null;
    }
  }

  async getMe(id: string, role) {
    role = mapRole(role);
    const user = await this.userRepository.getMe(id, role);
    const data = user[role];
    delete user[role];
    return { ...user, ...data };
  }

  async update(id: string, data) {
    return await this.userRepository.update(id, data);
  }

  async changePassword(data: ChangeUserPasswordDto, id: string) {
    const user = await this.userRepository.findById(id);

    const is_same_password = await bcrypt.compare(data.old_password, user?.password);

    if (!is_same_password) {
      throw new BadRequestException("Old password doesn't match");
    }

    const newPassword = await hashPassword(data.new_password);

    return await this.userRepository.updatePassword(id, newPassword);
  }

  async updatePassword(password: string, id: string) {
    const newPassword = await hashPassword(password);
    return await this.userRepository.updatePassword(id, newPassword);
  }

  async delete(id: string) {
    return await this.userRepository.delete(id);
  }
}
