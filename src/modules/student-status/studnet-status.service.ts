import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StudentStatusRepository } from './/student-status.repository';
import { ChangeStudentStatusDto } from './dto/student-status.dto';
import { StudentStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

// Qaysi statusdan qaysi statusga o'tish mumkin
const ALLOWED_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  new: [StudentStatus.active, StudentStatus.blocked],
  active: [StudentStatus.expired, StudentStatus.blocked, StudentStatus.frozen, StudentStatus.dropped, StudentStatus.completed],
  expired: [StudentStatus.active, StudentStatus.blocked, StudentStatus.dropped, StudentStatus.completed],
  blocked: [StudentStatus.active],
  frozen: [], // frozen statusi uchun transition'lar boshqa logika bilan boshqariladi
  dropped: [], // dropped statusidan boshqa statusga o'tish odatda bo'lmaydi
  completed: [], // completed statusidan boshqa statusga o'tish odatda bo'lmaydi
};


@Injectable()
export class StudentStatusService {
  constructor(private readonly studentStatusRepo: StudentStatusRepository) { }

  async changeStatus(
    student_id: string,
    dto: ChangeStudentStatusDto,
    changed_by_id?: string,
  ) {
    // 1. Student mavjudligini tekshirish
    const student = await this.studentStatusRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }

    const from_status = student.status;

    // 2. Bir xil statusga o'tishni bloklash
    if (from_status === dto.to_status) {
      throw new BadRequestException(
        `Student allaqachon ${dto.to_status} statusida`,
      );
    }

    // 3. Ruxsat etilgan transition tekshirish
    const allowed = ALLOWED_TRANSITIONS[from_status as StudentStatus] ?? [];
    if (!allowed.includes(dto.to_status) && allowed.length > 0) {
      throw new BadRequestException(
        `${from_status} => ${dto.to_status} o'tish mumkin emas`,
      );
    }


    // 5. Hozirgi guruh snapshot olish
    const currentGroup =
      await this.studentStatusRepo.getStudentCurrentGroup(student_id);

    // 6. Transaction: status tarixi yozish + student statusini yangilash
    const [statusRecord] = await Promise.all([
      this.studentStatusRepo.create({
        student_id,
        from_status,
        to_status: dto.to_status,
        comment: dto.comment,
        changed_by_id: changed_by_id ?? null,
        group_id: currentGroup?.group_id ?? null,
        mentor_id: currentGroup?.mentor_id ?? null,
        assistant_id: currentGroup?.assistant_id ?? null,
      }),
      this.studentStatusRepo.updateStudentStatus(student_id, dto.to_status),
    ]);

    return statusRecord;
  }

  // Cron job uchun — avtomatik expired qilish
  async changeStatusAuto(
    student_id: string,
    to_status: StudentStatus,
    comment: string,
  ) {
    const student = await this.studentStatusRepo.findStudentById(student_id);
    if (!student) return null;

    if (student.status === to_status) return null;

    const currentGroup =
      await this.studentStatusRepo.getStudentCurrentGroup(student_id);

    const [statusRecord] = await Promise.all([
      this.studentStatusRepo.create({
        student_id,
        from_status: student.status,
        to_status,
        changed_by_id: null, // avtomatik => null
        comment,
        group_id: currentGroup?.group_id ?? null,
        mentor_id: currentGroup?.mentor_id ?? null,
        assistant_id: currentGroup?.assistant_id ?? null,
      }),
      this.studentStatusRepo.updateStudentStatus(student_id, to_status),
    ]);

    return statusRecord;
  }

  async changeStatusToNew(id: string) {
    await this.studentStatusRepo.create({
      from_status: null,
      to_status: StudentStatus.new,
      student_id: id
    })
  }

  async getStudentStatusHistory(page, limit, student_id: string) {
    const where: any = {}

    if (student_id) {
      where.student_id = student_id
    }

    const data = await this.studentStatusRepo.findAll(page, limit, where);

    const res = data.items.map((d) => {
      return {
        id: d.student_id,
        name: d.student.user.first_name + d.student.user.last_name,
        from_status: d.from_status,
        to_status: d.to_status,
        comment: d.comment,
        date: d.changed_at
      }
    })

    return { ...data, items: res }

  }

  async getStatusCounts(startDate: string, endDate: string) {
    const result = await this.studentStatusRepo.getStatusCounts(startDate, endDate)

    return result.map(item => ({
      status: item.to_status,
      count: item._count.to_status,
    }));
  }

  @Cron('0 0,6,12,18 * * *') // 00:00, 06:00, 12:00, 18:00
  async expireStudents() {
    const expiredStudents = await this.studentStatusRepo.findExpiredStudents();

    if (!expiredStudents.length) {
      return;
    }
    const results = await Promise.allSettled(
      expiredStudents.map((student) =>
        this.changeStatusAuto(
          student.id,
          StudentStatus.expired,
          'Access period has expired',
        ),
      ),
    );
  }
}