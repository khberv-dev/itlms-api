import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';

interface CreateFrozenParams {
  student_id: string;
  reason: string;
  start_date: Date;
  end_date: Date;
  affects_retention: boolean;
  comment?: string;
  created_by_id?: string;
  group_id?: string | null;
  mentor_id?: string | null;
  assistant_id?: string | null;
}

@Injectable()
export class StudentFrozenRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Student va hozirgi guruh ma'lumotlarini olish
  async findStudentById(student_id: string) {
    return this.prisma.student.findUnique({
      where: { id: student_id },
      select: {
        id: true,
        status: true,
        access_expires_at: true,
        user: {
          select: { first_name: true, last_name: true, phone: true },
        },
      },
    });
  }

  async getStudentCurrentGroup(student_id: string) {
    return this.prisma.group_student.findFirst({
      where: { student_id, left_at: null },
      select: {
        group_id: true,
        mentor_id: true,
        assistant_id: true,
      },
    });
  }

  // Studentning aktiv (hali tugamagan) frozen borligini tekshirish
  async findActiveFrozen(student_id: string) {
    return this.prisma.student_frozen.findFirst({
      where: {
        student_id,
        end_date: { gte: new Date() },
        unfrozen_at: null,
      },
    });
  }

  // Frozen yaratish
  async create(params: CreateFrozenParams) {
    return this.prisma.student_frozen.create({
      data: {
        student_id: params.student_id,
        reason: params.reason as any,
        start_date: params.start_date,
        end_date: params.end_date,
        affects_retention: params.affects_retention,
        comment: params.comment,
        created_by_id: params.created_by_id ?? null,
        group_id: params.group_id ?? null,
        mentor_id: params.mentor_id ?? null,
        assistant_id: params.assistant_id ?? null,
      },
      include: this.defaultInclude(),
    });
  }

  // Frozen tugatish (unfreeze)
  async unfreeze(frozen_id: string) {
    return this.prisma.student_frozen.update({
      where: { id: frozen_id },
      data: {
        unfrozen_at: new Date(),
      },
      include: this.defaultInclude(),
    });
  }

  async updateStudentAccessExpiry(student_id: string, newExpiry: Date) {
    await this.prisma.student.update({
      where: { id: student_id },
      data: {
        access_expires_at: newExpiry,
      },
    });
  }

  // Student frozen tarixi
  async findAllByStudent(student_id: string) {
    return this.prisma.student_frozen.findMany({
      where: { student_id },
      orderBy: { start_date: 'desc' },
      include: this.defaultInclude(),
    });
  }

  // Admin: sana oralig'ida barcha frozen list
  async findAllByDateRange(start_date: Date, end_date: Date) {
    return this.prisma.student_frozen.findMany({
      where: {
        // start_date va end_date oralig'ida boshlangan yoki davom etayotganlar
        OR: [
          {
            start_date: { gte: start_date, lte: end_date },
          },
          {
            end_date: { gte: start_date, lte: end_date },
          },
          {
            start_date: { lte: start_date },
            end_date: { gte: end_date },
          },
        ],
      },
      orderBy: { start_date: 'desc' },
      include: this.defaultInclude(),
    });
  }

  // Tugash sanasi kelgan, hali unfreeze qilinmagan frozenlar (cron uchun)
  async findExpiredFrozens() {
    return this.prisma.student_frozen.findMany({
      where: {
        end_date: { lt: new Date() },
        unfrozen_at: null,
      },
      select: {
        id: true,
        student_id: true,
        end_date: true,
      },
    });
  }

  // Student access_expires_at ni yangilash (muzlagan muddatni qo'shish)
  async extendAccessExpiry(student_id: string, days: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: student_id },
      select: { access_expires_at: true },
    });

    const base = student?.access_expires_at ?? new Date();
    const newExpiry = new Date(base);
    newExpiry.setDate(newExpiry.getDate() + days);

    return this.prisma.student.update({
      where: { id: student_id },
      data: { access_expires_at: newExpiry },
    });
  }

  private defaultInclude() {
    return {
      student: {
        select: {
          id: true,
          user: {
            select: { first_name: true, last_name: true, phone: true },
          },
        },
      },
      created_by: {
        select: { id: true, first_name: true, last_name: true, role: true },
      },
      group: {
        select: { id: true, name: true },
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
    };
  }
}
