import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { DroppedReason } from '@prisma/client';

interface CreateDroppedParams {
  student_id: string;
  reason: DroppedReason;
  comment?: string;
  created_by_id: string;
  group_id?: string | null;
  mentor_id?: string | null;
  assistant_id?: string | null;
}

@Injectable()
export class StudentDroppedRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findStudentById(student_id: string) {
    return this.prisma.student.findUnique({
      where: { id: student_id },
      select: {
        id: true,
        status: true,
        group_id: true,
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

  async getDroppedReasonCounts(startDate: string, endDate:string) {
    return this.prisma.student_dropped.groupBy({
      by: ['reason'],
      where: {
        dropped_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: {
        reason: true,
      },
    });
  }

  // Studentda allaqachon dropped record borligini tekshirish
  async findExistingDropped(student_id: string) {
    return this.prisma.student_dropped.findFirst({
      where: { student_id },
      orderBy: { dropped_at: 'desc' },
    });
  }

  async create(params: CreateDroppedParams) {
    return this.prisma.student_dropped.create({
      data: {
        student_id: params.student_id,
        reason: params.reason,
        comment: params.comment,
        created_by_id: params.created_by_id,
        group_id: params.group_id ?? null,
        mentor_id: params.mentor_id ?? null,
        assistant_id: params.assistant_id ?? null,
      },
      include: this.defaultInclude(),
    });
  }

  // Student tarixi (bir student bir necha marta drop/rejoin qilgan bo'lishi mumkin)
  async findAllByStudent(student_id: string) {
    return this.prisma.student_dropped.findMany({
      where: { student_id },
      orderBy: { dropped_at: 'desc' },
      include: this.defaultInclude(),
    });
  }

  // Admin: sana oralig'ida dropped listini olish
  async findAllByDateRange(start_date: Date, end_date: Date) {
    return this.prisma.student_dropped.findMany({
      where: {
        dropped_at: {
          gte: start_date,
          lte: end_date,
        },
      },
      orderBy: { dropped_at: 'desc' },
      include: this.defaultInclude(),
    });
  }

  // Sabab bo'yicha statistika (sana oralig'ida)
  async getStatsByReason(start_date: Date, end_date: Date) {
    return this.prisma.student_dropped.groupBy({
      by: ['reason'],
      where: {
        dropped_at: { gte: start_date, lte: end_date },
      },
      _count: { reason: true },
      orderBy: { _count: { reason: 'desc' } },
    });
  }

  // Guruh bo'yicha dropped statistika
  async getStatsByGroup(start_date: Date, end_date: Date) {
    return this.prisma.student_dropped.groupBy({
      by: ['group_id'],
      where: {
        dropped_at: { gte: start_date, lte: end_date },
        group_id: { not: null },
      },
      _count: { group_id: true },
      orderBy: { _count: { group_id: 'desc' } },
    });
  }

  // Mentor bo'yicha dropped statistika
  async getStatsByMentor(start_date: Date, end_date: Date) {
    return this.prisma.student_dropped.groupBy({
      by: ['mentor_id'],
      where: {
        dropped_at: { gte: start_date, lte: end_date },
        mentor_id: { not: null },
      },
      _count: { mentor_id: true },
      orderBy: { _count: { mentor_id: 'desc' } },
    });
  }

  // group_student dan studentni chiqarish (left_at set qilish)
  async leaveGroup(student_id: string) {
    return this.prisma.group_student.updateMany({
      where: { student_id, left_at: null },
      data: { left_at: new Date() },
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