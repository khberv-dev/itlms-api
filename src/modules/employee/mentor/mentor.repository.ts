import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';
import { AssignmentStatus } from '@prisma/client';

@Injectable()
export class MentorRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data) {
    return await this.prismaService.mentor.create({
      data: { ...data },
      include: { user: true },
    });
  }

  async findAll() {
    return await this.prismaService.mentor.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            avatar_url: true,
            phone: true,
            role: true,
            created_at: true,
          },
        },
        mentor_groups: {
          select: { id: true },
        },
        assistant_groups: {
          select: { id: true },
        },
      },
      orderBy: {
        user: { created_at: 'desc' },
      },
    });
  }

  async findOne(id: string) {
    const data = await this.prismaService.mentor
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

  async findMentorGroups(mentor_id: string) {
    const groups = await this.prismaService.group.findMany({
      where: {
        OR: [{ mentor_id: mentor_id }, { assistant_id: mentor_id }],
      },
      include: {
        level: true,
        students: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return groups;
  }

  async update(id: string, data) {
    return await this.prismaService.mentor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prismaService.mentor.delete({ where: { id } });
  }

  async getGroupsCount(mentor_id: string): Promise<number> {
    return this.prismaService.group.count({
      where: {
        mentor_id,
      },
    });
  }

  async getTotalStudentsCount(mentor_id: string): Promise<number> {
    return this.prismaService.group_student.count({
      where: {
        mentor_id,
        left_at: null, // faqat active studentlar
      },
    });
  }

  async getActiveAssignmentsCount(mentor_id: string): Promise<number> {
    return this.prismaService.assignment.count({
      where: {
        mentor_id,
        status: AssignmentStatus.active,
      },
    });
  }

  async getPendingReviewsCount(mentor_id: string): Promise<number> {
    return this.prismaService.assignment_submission.count({
      where: {
        assignment: {
          mentor_id,
        },
        reviewed_at: null,
      },
    });
  }
}
