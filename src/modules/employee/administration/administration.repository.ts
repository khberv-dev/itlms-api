import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class AdministrationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data) {
    return await this.prismaService.administration.create({
      data: { ...data },
      include: { user: true },
    });
  }

  async findAll() {
    return await this.prismaService.administration.findMany();
  }

  async findOne(id: string) {
    const data = await this.prismaService.administration
      .findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              first_name: true,
              phone: true,
              last_name: true,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('data not found');
      });

    const user = data?.user;

    return { ...user, ...data };
  }

  async update(id: string, data) {
    return await this.prismaService.administration.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prismaService.administration.delete({ where: { id } });
  }
}
