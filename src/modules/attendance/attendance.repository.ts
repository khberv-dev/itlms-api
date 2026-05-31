import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../_prisma/prisma.service';

@Injectable()
export class AttendanceRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async findAll() {
        return await this.prismaService.attendance.findMany()
    }

    async getGroupStudentsForAttendance(groupId: string) {
        return this.prismaService.student.findMany({
            where: {
                group_id: groupId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        avatar_url: true,
                        first_name: true,
                        last_name: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                user: {
                    first_name: 'asc',
                },
            },
        });
    }

    async getAttendanceByGroupAndDate(groupId: string, date: string) {
        const attendanceDate = new Date(date);

        return this.prismaService.attendance.findMany({
            where: {
                group_id: groupId,
                date: attendanceDate,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                avatar_url: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
    }  
    
    async getStudentAttendance(studentId: string) {
        return this.prismaService.attendance.findMany({
            where: {
                student_id: studentId,
            },
            select:{
                id: true,
                date: true,
                is_present: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async createManyAttendance(data: {
        student_id: string;
        group_id: string;
        mentor_id: string;
        date: Date;
        is_present: boolean;
    }[]) {
        return this.prismaService.attendance.createMany({
            data,
            skipDuplicates: true, // agar unique constraint qo‘shsangiz ishlaydi
        });
    }

    async update(id: string, data) {
        return await this.prismaService.attendance.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return await this.prismaService.attendance.delete({ where: { id } })
    }

}
