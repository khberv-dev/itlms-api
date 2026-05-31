import { Injectable } from '@nestjs/common';

import { SellerRepository } from './seller.repository';
import { UserService } from 'src/modules/user/user.service';
import { Role } from '@prisma/client';
import { CreateSellerDto, UpdateSellerDto } from './dto';
import { getAmocrmUsers } from 'src/common/helpers/bitrix';
import { pickFields } from 'src/common/helpers';

@Injectable()
export class SellerService {
    private USER_FIELDS = ['first_name', 'last_name', 'phone', 'birthday'];
    private SELLER_FIELDS = ['sip', 'amocrm_id', 'level', 'work_start_time', 'work_end_time'];
    constructor(
        private readonly sellerRepository: SellerRepository,
        private readonly userService: UserService
    ) { }

    async findAll() {
        return await this.sellerRepository.findAll();
    }

    async findOne(id: string) {
        return await this.sellerRepository.findOne(id);
    }

    async getAmocrmUsers() {
        return await getAmocrmUsers()
    }

    async create(data: CreateSellerDto) {
        const user_data = pickFields(data, this.USER_FIELDS);
        const seller_data = pickFields(data, this.SELLER_FIELDS);
        const user = await this.userService.create({ ...user_data, role: Role.seller });
        await this.sellerRepository.create({ ...seller_data, user_id: user.id });
        return user;
    }

    async update(data: UpdateSellerDto, id: string) {
        const seller: any = await this.sellerRepository.findOne(id);

        const user_data = pickFields(data, this.USER_FIELDS);
        const seller_data = pickFields(data, this.SELLER_FIELDS);

        await Promise.all([
            Object.keys(user_data).length &&
            this.userService.update(seller.user_id, user_data),

            Object.keys(seller_data).length &&
            this.sellerRepository.update(id, seller_data),
        ]);

        return this.findOne(id);
    }

    async delete(id: string) {
        return await this.sellerRepository.delete(id);
    }

}
