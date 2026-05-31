import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StudentDroppedRepository } from './student-dropped.repository';
import { StudentStatusService } from '../student-status/studnet-status.service';
import { CreateDroppedDto, DroppedListQueryDto } from './dto/student-dropped.dto';
import { StudentStatus } from '@prisma/client';

// Dropped bo'lishi mumkin bo'lgan statuslar
const DROPPABLE_STATUSES: StudentStatus[] = [
  StudentStatus.active,
  StudentStatus.expired,
  StudentStatus.frozen,
];

@Injectable()
export class StudentDroppedService {
  constructor(
    private readonly droppedRepo: StudentDroppedRepository,
    private readonly studentStatusService: StudentStatusService,
  ) { }

  async drop(
    student_id: string,
    dto: CreateDroppedDto,
    created_by_id: string,
  ) {
    // 1. Student mavjudligini tekshirish
    const student = await this.droppedRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }

    // 2. Dropped qilish mumkin bo'lgan statusni tekshirish
    if (!DROPPABLE_STATUSES.includes(student.status as StudentStatus)) {
      throw new BadRequestException(
        `${student.status} statusidagi studentni dropped qilib bo'lmaydi`,
      );
    }

    // 3. Hozirgi guruh snapshotini olish
    const currentGroup =
      await this.droppedRepo.getStudentCurrentGroup(student_id);

    // 4. Dropped record yaratish
    const dropped = await this.droppedRepo.create({
      student_id,
      reason: dto.reason,
      comment: dto.comment,
      created_by_id,
      group_id: currentGroup?.group_id ?? null,
      mentor_id: currentGroup?.mentor_id ?? null,
      assistant_id: currentGroup?.assistant_id ?? null,
    });

    // 5. Student statusini "blocked" ga o'zgartirish
    //    (dropped = kompaniyani tark etgan, blocked orqali qayta kiritish mumkin)
    await this.studentStatusService.changeStatus(
      student_id,
      {
        to_status: StudentStatus.dropped,
        comment: dto.comment,
      },
      created_by_id,
    );

    // 6. Guruhdan chiqarish (group_student.left_at = now)
    if (currentGroup) {
      await this.droppedRepo.leaveGroup(student_id);
    }

    return dropped;
  }

  async getStudentDroppedHistory(student_id: string) {
    const student = await this.droppedRepo.findStudentById(student_id);
    if (!student) {
      throw new NotFoundException(`Student topilmadi: ${student_id}`);
    }
    return this.droppedRepo.findAllByStudent(student_id);
  }

  async getAllDroppedByDateRange(query: DroppedListQueryDto) {
    const start = new Date(query.start_date);
    const end = new Date(query.end_date);

    if (end < start) {
      throw new BadRequestException(
        'end_date start_date dan katta bo\'lishi kerak',
      );
    }

    return this.droppedRepo.findAllByDateRange(start, end);
  }

  // Sabab bo'yicha statistika — nima sababdan ko'p ketayapti?
  async getStatsByReason(query: DroppedListQueryDto) {
    const start = new Date(query.start_date);
    const end = new Date(query.end_date);
    return this.droppedRepo.getStatsByReason(start, end);
  }

  // Guruh bo'yicha statistika — qaysi guruhdan ko'p ketayapti?
  async getStatsByGroup(query: DroppedListQueryDto) {
    const start = new Date(query.start_date);
    const end = new Date(query.end_date);
    return this.droppedRepo.getStatsByGroup(start, end);
  }

  // Mentor bo'yicha statistika — qaysi mentordan ko'p ketayapti?
  async getStatsByMentor(query: DroppedListQueryDto) {
    const start = new Date(query.start_date);
    const end = new Date(query.end_date);
    return this.droppedRepo.getStatsByMentor(start, end);
  }

  async getDroppedReasonCounts(startDate: string, endDate: string) {
    const result = await this.droppedRepo.getDroppedReasonCounts(startDate,endDate)

    return result.map(item => ({
      reason: item.reason,
      count: item._count.reason,
    }));
  }
}