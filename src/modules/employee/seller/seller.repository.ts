import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class SellerRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async create(data) {
        return await this.prismaService.seller.create({
            data: { ...data },
            include: { user: true }
        });
    }

    async findAll() {
        const now = new Date();

        return this.prismaService.seller.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        first_name: true,
                        last_name: true,
                    }
                },
                month_plans: {
                    where: {
                        year: now.getFullYear(),
                        month: now.getMonth() + 1,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        const data = await this.prismaService.seller.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        first_name: true,
                        phone: true,
                        last_name: true
                    }
                }
            }
        }).catch(() => {
            throw new NotFoundException('data not found');
        });

        const user = data?.user;

        return { ...user, ...data }
    }

    async update(id: string, data) {
        return await this.prismaService.seller.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return await this.prismaService.seller.delete({ where: { id } })
    }

}
