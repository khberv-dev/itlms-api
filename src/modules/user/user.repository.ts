import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../_prisma/prisma.service';
import { mapRole } from './helpers/role-map';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data) {
    return await this.prismaService.user.create({
      data: { ...data },
    });
  }

  async isExist(where) {
    return await this.prismaService.user.findFirst({ where });
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prismaService.user
      .findUnique({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException('data not found');
      });

    return { ...user, password: null };
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } }).catch(() => {
      throw new NotFoundException('data not found');
    });

    return user;
  }

  async getMe(id: string, role) {
    const user = await this.prismaService.user
      .findFirst({
        where: { [role]: { id } },
        include: { [role]: true },
      })
      .catch((err) => {
        throw new BadRequestException(err.toString());
      });
    return { ...user, password: null };
  }

  async findByPhone(phone: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phone,
      },
    });

    const role = mapRole(user?.role as any);

    const user_by_role = user
      ? await this.prismaService.user.findFirst({
          where: { id: user.id },
          include: { [role]: true },
        })
      : null;

    return user_by_role;
  }

  async update(id: string, data) {
    return await this.prismaService.user.update({
      where: { id },
      data,
      include: { avatar: true },
    });
  }

  async updatePassword(id: string, password: string) {
    return await this.prismaService.user.update({
      where: { id },
      data: { password },
    });
  }

  async delete(id: string) {
    return await this.prismaService.user.delete({ where: { id } });
  }
}
