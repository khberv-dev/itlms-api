import { Injectable } from '@nestjs/common';

import { AdministrationRepository } from './administration.repository';
import { UserService } from 'src/modules/user/user.service';
import { Role } from '@prisma/client';
import { CreateAdministrationDto } from './dto';

@Injectable()
export class AdministrationService {
    constructor(
        private readonly administrationRepository: AdministrationRepository,
        private readonly userService: UserService
    ) { }

    async findAll() {
        return await this.administrationRepository.findAll();
    }

    async findOne(id: string) {
        const user = await this.administrationRepository.findOne(id);
    }

    async create(data: CreateAdministrationDto) {
        const user = await this.userService.create(data);
        await this.administrationRepository.create({ user_id: user.id });
        return user
    }

    async delete(id: string) {
        return await this.administrationRepository.delete(id);
    }
}
