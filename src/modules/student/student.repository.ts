import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../_prisma/prisma.service';
import { prismaPaginate } from 'src/common/utils';

@Injectable()
export class StudentRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async create(data) {
        return await this.prismaService.student.create({
            data: { ...data },
            include: { user: true }
        });
    }

    async findAll(where = {}) {
        return await prismaPaginate(this.prismaService.student, {
            include: {
                user: true
            },
            where
        });
    }

    async getStudentsForAdmin(where, page: number, limit: number) {

        return await prismaPaginate(this.prismaService.student, {
            page,
            limit,
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        avatar_url: true,
                        phone: true,
                        created_at: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        level: {
                            select: {
                                id: true,
                                level: true,
                            },
                        },
                        mentor: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                        // assistant is also a mentor relation in schema
                        assistant: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                attendances: {
                    select: {
                        is_present: true,
                    },
                },
                assignment_submissions: {
                    select: {
                        score: true,
                    },
                },
            },
            orderBy: { user: { created_at: 'desc' } },
        });
    }

    async getStudentsExpiry(page: number, limit: number, filter?: 'active' | 'expired' | '7') {
        const today = new Date();
        const in7Days = new Date();
        in7Days.setDate(today.getDate() + 7);

        let where: any = {};

        if (filter === 'active') {
            where = {
                status: 'active',
            };
        } else if (filter === 'expired') {
            where = {
                status: { in: ['expired', 'blocked'] },
            };
        } else if (filter === '7') {
            where = {
                access_expires_at: {
                    gte: today,
                    lte: in7Days,
                },
            };
        }

        const students = await prismaPaginate(this.prismaService.student, {
            page,
            limit,
            where,
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        created_at: true,
                        email: true,
                        avatar_url: true,
                    },
                },
                group: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                access_expires_at: 'asc',
            },
        });

        return students;
    }

    async getStudentStatusStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const [active_payments, expired_payments, expiring_soon] =
            await Promise.all([
                // active studentlar soni
                this.prismaService.student.count({
                    where: { status: 'active' },
                }),

                // expired yoki blocked studentlar soni
                this.prismaService.student.count({
                    where: { status: { in: ['expired', 'blocked'] } },
                }),

                // expire bo'lishiga 7 kundan kam qolgan, lekin hali expire bo'lmaganlar
                this.prismaService.student.count({
                    where: {
                        status: 'active',
                        access_expires_at: {
                            gte: today,
                            lt: sevenDaysLater,
                        },
                    },
                }),
            ]);

        return { active_payments, expired_payments, expiring_soon };
    }

    async findOne(id: string) {
        const data = await this.prismaService.student.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        role: true,
                        first_name: true,
                        phone: true,
                        last_name: true,
                        avatar_id: true,
                        avatar_url: true
                    }
                }
            }
        }).catch(() => {
            throw new NotFoundException('data not found');
        });

        const user = data?.user;

        return { ...user, ...data }
    }

    async getProfile(studentId: string) {
        return this.prismaService.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        phone: true,
                        avatar_url: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        level: {
                            select: { level: true },
                        },
                        mentor: {
                            select: {
                                id: true,
                                user: { select: { first_name: true, last_name: true } },
                            },
                        },
                        assistant: {
                            select: {
                                id: true,
                                user: { select: { first_name: true, last_name: true } },
                            },
                        },
                    },
                },
            },
        });
    }

    // guruhning barcha studentlarini attendance va submission ballari bilan olish
    async getGroupStudentsWithPoints(groupId: string) {
        return this.prismaService.student.findMany({
            where: { group_id: groupId },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        avatar_url: true,
                    },
                },
                attendances: {
                    where: { group_id: groupId },
                    select: { is_present: true },
                },
                assignment_submissions: {
                    select: { score: true },
                },
            },
        });
    }

    async getStudentAttendancesAndSubmissions(studentId: string, groupId: string) {
        return this.prismaService.student.findUnique({
            where: { id: studentId },
            select: {
                attendances: {
                    where: { group_id: groupId },
                    select: { is_present: true },
                },
                assignment_submissions: {
                    select: { score: true },
                },
            },
        });
    }

    async update(id: string, data) {
        return await this.prismaService.student.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return await this.prismaService.student.delete({ where: { id } })
    }

    async getTotalStudents(): Promise<number> {
        return this.prismaService.student.count();
    }

    async getActiveGroups(): Promise<number> {
        return this.prismaService.group.count({
            where: { status: 'active' },
        });
    }

    async getTotalTeachers(): Promise<number> {
        return this.prismaService.mentor.count();
    }

    async getStudentsForAddingToGroup() {
        return await this.prismaService.student.findMany({
            where: {
                OR: [
                    { status: 'new' },
                    {
                        AND: [
                            { group_id: null },
                            { status: 'active' },
                        ]
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        phone: true,
                        avatar_url: true,
                        created_at: true,
                    }
                }
            }
        })
    }

    async getBlockedUsers(): Promise<number> {
        return this.prismaService.student.count({
            where: {
                status: { in: ['blocked', 'expired'] },
            }
        });
    }

}
