import { Injectable } from '@nestjs/common';

import { AdministrationRepository } from './administration.repository';
import { UserService } from 'src/modules/user/user.service';
import { CreateAdministrationDto, UpdateAdministrationDto } from './dto';

@Injectable()
export class AdministrationService {
  constructor(
    private readonly administrationRepository: AdministrationRepository,
    private readonly userService: UserService,
  ) {}

  async findAll() {
    return await this.administrationRepository.findAll();
  }

  async findOne(id: string) {
    return await this.administrationRepository.findOne(id);
  }

  async create(data: CreateAdministrationDto) {
    const user = await this.userService.create(data);
    await this.administrationRepository.create({ user_id: user.id });
    return user;
  }

  async update(id: string, data: UpdateAdministrationDto) {
    const admin = await this.administrationRepository.findOne(id);
    return await this.userService.update((admin as any).user_id, data);
  }

  async delete(id: string) {
    return await this.administrationRepository.delete(id);
  }
}
