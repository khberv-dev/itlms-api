import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../_prisma/prisma.service';

@Injectable()
export class SaleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data) {
    return await this.prismaService.sale.create({
      data,
      include: {
        seller: { include: { user: true } },
        student: true,
        file: true,
      },
    });
  }

  async findAll() {
    return await this.prismaService.sale.findMany();
  }

  async findOne(id: string) {
    const data = await this.prismaService.sale
      .findUnique({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException('data not found');
      });

    return data;
  }

  async findBySellerId(seller_id: string) {
    return await this.prismaService.sale.findMany({
      where: { seller_id },
      include: {
        student: {
          include: {
            user: {
              select: { first_name: true, last_name: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(id: string, data) {
    return await this.prismaService.sale.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prismaService.sale.delete({ where: { id } });
  }

  async createSaleBreakDown(data) {
    return await this.prismaService.sale_break_down.createMany({
      data,
    });
  }
}
