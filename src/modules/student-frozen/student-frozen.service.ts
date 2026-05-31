import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StudentFrozenRepository } from './student-frozen.repository';
import { StudentStatusService } from '../student-status/studnet-status.service';
import { CreateFrozenDto, FrozenListQueryDto } from './dto/student-frozen.dto';
import { FrozenReason, StudentStatus } from '@prisma/client';

// Qaysi frozen sabablari retention'ga ta'sir qiladi
const AFFECTS_RETENTION_REASONS: FrozenReason[] = [FrozenReason.course_dislike];

@Injectable()
export class StudentFrozenService {
  constructor(
    private readonly frozenRepo: StudentFrozenRepository,
    private readonly studentStatusService: StudentStatusService,
  ) {}

  async freeze(student_id: string, dto: CreateFrozenDto, created_by_id: string) {
    // 1. Student mavjudligini tekshirish
    const student = await this.frozenRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }

    // 2. Student active ekanligini tekshirish
    if (student.status !== StudentStatus.active) {
      throw new BadRequestException(`Faqat active student muzlatilishi mumkin. Hozirgi status: ${student.status}`);
    }

    // 3. Allaqachon aktiv frozen borligini tekshirish
    const existingFrozen = await this.frozenRepo.findActiveFrozen(student_id);
    if (existingFrozen) {
      throw new BadRequestException('Studentda allaqachon aktiv muzlatish mavjud');
    }

    // 4. Sanalarni tekshirish
    const start = new Date();
    const end = new Date(dto.end_date);
    if (end <= start) {
      throw new BadRequestException("end_date start_date dan keyin bo'lishi kerak");
    }

    // 5. Muzlatish muddatini hisoblash (kunlarda)
    const frozenDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // 6. Hozirgi guruh snapshotini olish
    const currentGroup = await this.frozenRepo.getStudentCurrentGroup(student_id);

    // 7. Retention ta'sirini hisoblash
    const affects_retention = AFFECTS_RETENTION_REASONS.includes(dto.reason);

    // 8. Frozen yaratish
    const frozen = await this.frozenRepo.create({
      student_id,
      reason: dto.reason,
      start_date: start,
      end_date: end,
      affects_retention,
      comment: dto.comment,
      created_by_id,
      group_id: currentGroup?.group_id ?? null,
      mentor_id: currentGroup?.mentor_id ?? null,
      assistant_id: currentGroup?.assistant_id ?? null,
    });

    // 9. Student statusini frozen ga o'zgartirish (tarixga yoziladi)
    await this.studentStatusService.changeStatus(
      student_id,
      {
        to_status: StudentStatus.frozen,
        comment: dto.comment,
      },
      created_by_id,
    );

    // 10. access_expires_at ni muzlagan muddatga surish
    await this.frozenRepo.extendAccessExpiry(student_id, frozenDays);

    return frozen;
  }

  async unfreeze(student_id: string, unfrozen_by_id: string) {
    // 1. Student mavjudligini tekshirish
    const student = await this.frozenRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }

    // 2. Aktiv frozen borligini tekshirish
    const activeFrozen = await this.frozenRepo.findActiveFrozen(student_id);
    if (!activeFrozen) {
      throw new BadRequestException('Studentda aktiv muzlatish topilmadi');
    }

    // 3. Frozen tugatish
    const unfrozen = await this.frozenRepo.unfreeze(activeFrozen.id);

    // 🆕 4. Muzlagan vaqtni hisoblash
    const start = new Date(activeFrozen.start_date);
    const end = new Date(unfrozen.unfrozen_at!);

    const frozenDurationMs = end.getTime() - start.getTime();

    // 🆕 5. access_expires_at ni update qilish
    if (student.access_expires_at) {
      const newExpireDate = new Date(new Date(student.access_expires_at).getTime() + frozenDurationMs);

      await this.frozenRepo.updateStudentAccessExpiry(student_id, newExpireDate);
    }

    // 6. Statusni active qilish
    await this.studentStatusService.changeStatus(
      student_id,
      {
        to_status: StudentStatus.active,
        comment: 'Muzlatish tugatildi',
      },
      unfrozen_by_id,
    );

    return unfrozen;
  }

  async getStudentFrozenHistory(student_id: string) {
    const student = await this.frozenRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }
    return this.frozenRepo.findAllByStudent(student_id);
  }

  async getAllFrozenByDateRange(query: FrozenListQueryDto) {
    const start = new Date(query.start_date);
    const end = new Date(query.end_date);

    if (end < start) {
      throw new BadRequestException("end_date start_date dan katta bo'lishi kerak");
    }

    return this.frozenRepo.findAllByDateRange(start, end);
  }

  // Cron job: muddati tugagan frozenlarni avtomatik tugatish
  async processExpiredFrozens() {
    const expiredFrozens = await this.frozenRepo.findExpiredFrozens();

    const results = await Promise.allSettled(
      expiredFrozens.map(async (frozen) => {
        await this.frozenRepo.unfreeze(frozen.id);
        await this.studentStatusService.changeStatusAuto(
          frozen.student_id,
          StudentStatus.active,
          'Muzlatish tugatildi (avtomatik)',
        );
      }),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { processed: expiredFrozens.length, succeeded, failed };
  }
}
