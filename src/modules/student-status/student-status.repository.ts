import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { StudentStatus } from '@prisma/client';
import { prismaPaginate } from 'src/common/utils';

interface CreateStatusParams {
  student_id: string;
  from_status: StudentStatus | null;
  to_status: StudentStatus;
  changed_by_id?: string | null;
  affects_retention?: boolean;
  comment?: string;
  group_id?: string | null;
  mentor_id?: string | null;
  assistant_id?: string | null;
}

@Injectable()
export class StudentStatusRepository {
  constructor(private readonly prisma: PrismaService) { }

  // Student hozirgi aktiv guruh ma'lumotlarini olish (snapshot uchun)
  async getStudentCurrentGroup(student_id: string) {
    return this.prisma.group_student.findFirst({
      where: {
        student_id,
        left_at: null,
      },
      select: {
        group_id: true,
        mentor_id: true,
        assistant_id: true,
      },
    });
  }

  // Studentning oxirgi statusini olish
  async getLastStatus(student_id: string) {
    return this.prisma.student_status.findFirst({
      where: { student_id },
      orderBy: { changed_at: 'desc' },
      select: { to_status: true },
    });
  }

  // Yangi status yozuvi yaratish
  async create(params: CreateStatusParams) {
    return this.prisma.student_status.create({
      data: {
        student_id: params.student_id,
        from_status: params.from_status,
        to_status: params.to_status,
        changed_by_id: params.changed_by_id ?? null,
        comment: params.comment,
        group_id: params.group_id ?? null,
        mentor_id: params.mentor_id ?? null,
        assistant_id: params.assistant_id ?? null,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                phone: true,
              },
            },
          },
        },
        changed_by: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
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
      },
    });
  }

  // Student status o'zini yangilash
  async updateStudentStatus(student_id: string, status: StudentStatus) {
    return this.prisma.student.update({
      where: { id: student_id },
      data: { status },
    });
  }

  // Studentning barcha status tarixini olish
  async findAll(page,limit,where) {
    return  await prismaPaginate(this.prisma.student_status, {
      where,
      page,
      limit,
      orderBy: { changed_at: 'desc' },
      include: {
        student:{
          include:{
            user:{
              select:{
                first_name:true,
                last_name:true,
                id:true
              }
            }
          }
        }
      },
    }) as any
  }

  // Student mavjudligini tekshirish
  async findStudentById(student_id: string) {
    return this.prisma.student.findUnique({
      where: { id: student_id },
      select: {
        id: true,
        status: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async getStatusCounts(startDate: string, endDate: string) {
    return this.prisma.student_status.groupBy({
      by: ['to_status'],
      where: {
        changed_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: {
        to_status: true,
      },
    });
  }

  async findExpiredStudents(){
    return await this.prisma.student.findMany({
      where:{
        access_expires_at:{lt: new Date()},
        status: StudentStatus.active
      }
    })
  }
}