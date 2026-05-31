import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { prismaPaginate } from 'src/common/utils';

@Injectable()
export class GroupRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async findAll(where) {
        return this.prismaService.group.findMany({
            where,
            include: {
                level: {
                    select: { id: true, level: true },
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
                _count: {
                    select: { students: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const data = await this.prismaService.group.findUnique({
            where: { id },
            include: {
                level: true,
                mentor: {
                    include:{user: true}
                },
                assistant: {
                    include:{user: true}
                },
            },
        });

        if (!data) throw new NotFoundException('Guruh topilmadi');
        return data;
    }

    async create(data: CreateGroupDto) {
        return await this.prismaService.group.create({
            data: {
                name: data.name,
                status: data.status,
                level_id: data.level_id,
                mentor_id: data.mentor_id,
                assistant_id: data.assistant_id,
            },
            include: { level: true, mentor: true, assistant: true },
        });
    }

    async update(id: string, data: UpdateGroupDto) {
        return await this.prismaService.group.update({
            where: { id },
            data: {
                name: data.name,
                status: data.status,
                level_id: data.level_id,
                mentor_id: data.mentor_id,
                assistant_id: data.assistant_id,
            },
            include: { level: true, mentor: true, assistant: true },
        });
    }

    // Bir yoki bir nechta student qo'shish + history yaratish
    async addStudentsToGroup(group_id: string, student_ids: string[]) {
        const group = await this.prismaService.group.findUnique({ where: { id: group_id } });
        if (!group) throw new NotFoundException('Guruh topilmadi');

        return await this.prismaService.$transaction(async (prisma) => {
            // 1. group_student jadvaliga qo‘shish
            const created = await prisma.group_student.createMany({
                data: student_ids.map((student_id) => ({
                    group_id,
                    student_id,
                    mentor_id: group.mentor_id,
                    assistant_id: group.assistant_id,
                })),
                skipDuplicates: true,
            });

            // 2. Har bir studentning group_id (asosiy/current group) maydonini yangilash
            await prisma.student.updateMany({
                where: {
                    id: { in: student_ids },
                },
                data: {
                    group_id, // endi student.group_id yangi guruhga bog‘lanadi
                    status: 'active', // statusni active ga o‘zgartirish (agar kerak bo‘lsa)
                },
            });

            return created;
        });
    }

    async leftStudentsFromGroup(group_id: string, student_id: string) {
        await this.prismaService.group_student.updateMany({
            where: {
                group_id,
                student_id,
                left_at: null, // faqat hozirgi guruhda bo‘lgan studentlarni yangilash
            },
            data: {
                left_at: new Date(), // student guruhdan chiqqan vaqtni saqlash
            },
        });

        await this.prismaService.student.update({where: { id: student_id }, data: { group_id: null } });  
    }

    async createLevel(level:string){
        return await this.prismaService.group_level.create({ data: { level } });
    }

    async getLevels() {
        return await this.prismaService.group_level.findMany();
    }

    async delete(id: string) {
        return await this.prismaService.group.delete({ where: { id } });
    }
}