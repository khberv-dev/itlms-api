import { Injectable, NotFoundException } from '@nestjs/common';

import { StudentRepository } from './student.repository';
import { UserService } from 'src/modules/user/user.service';
import { Role, StudentStatus } from '@prisma/client';
import { CreateStudentDto, GetStudentFilterDto, UpdateStudentDto } from './dto';
import { buildStudentWhere } from './filters/student.filter';
import { pickFields } from 'src/common/helpers';
import { FileService } from '../file/file.service';
import { StudentStatusService } from '../student-status/studnet-status.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly studentStatusService: StudentStatusService,
  ) {}
  private USER_FIELDS = ['first_name', 'last_name', 'phone', 'birthday', 'role', 'email'];
  private STUDENT_FIELDS = ['telegram', 'job', 'address', 'status'];

  async findAll(filter) {
    const where = buildStudentWhere(filter);
    return await this.studentRepository.findAll(where);
  }

  async getStudentsForAdmin(filter: GetStudentFilterDto, page: number, limit: number) {
    const where = buildStudentWhere(filter);
    const { items, meta } = await this.studentRepository.getStudentsForAdmin(where, page, limit);

    const mappedItems = items.map((student: any) => {
      // attendance_rate: is_present === true larni umumiy attendancelarga nisbati (%)
      const totalAttendances = student.attendances.length;
      const presentCount = student.attendances.filter((a: any) => a.is_present === true).length;
      const attendance_rate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

      // total_score: submission score summasi + is_present true larni soni
      const submissionScore = student.assignment_submissions.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0);
      const total_score = submissionScore + presentCount;

      const fullName = `${student.user?.first_name ?? ''} ${student.user?.last_name ?? ''}`.trim();

      return {
        id: student.id,
        avatar_url: student.user?.avatar_url ?? null,
        name: fullName,
        email: student.user?.email ?? null,
        phone: student.user?.phone ?? null,
        status: student.status,
        level_id: student.group?.level?.id ?? null,
        level_name: student.group?.level?.level ?? null,
        user_id: student.user_id,
        created_at: student.user?.created_at ?? null,
        group: student.group
          ? {
              id: student.group.id,
              name: student.group.name,
            }
          : null,
        teacher: student.group?.mentor
          ? {
              id: student.group.mentor.id,
              name: `${student.group.mentor.user?.first_name ?? ''} ${student.group.mentor.user?.last_name ?? ''}`.trim(),
            }
          : null,
        assistant_teacher: student.group?.assistant
          ? {
              id: student.group.assistant.id,
              name: `${student.group.assistant.user?.first_name ?? ''} ${student.group.assistant.user?.last_name ?? ''}`.trim(),
            }
          : null,
        attendance_rate,
        total_score,
        payment_expiry: student.access_expires_at ?? null,
      };
    });

    return { items: mappedItems, meta };
  }

  async getStudentsExpiry(page: number, limit: number, filter?: 'active' | 'expired' | '7') {
    const students = await this.studentRepository.getStudentsExpiry(page, limit, filter);

    const today = new Date();

    const mappedItems = students.items.map((student: any, index: number) => {
      const fullName = `${student.user?.first_name ?? ''} ${student.user?.last_name ?? ''}`.trim();

      const endDate = student.access_expires_at ? new Date(student.access_expires_at) : null;

      let daysRemaining = 0;
      if (endDate) {
        const diff = endDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      // status: access_expires_at o'tib ketgan bo'lsa "Expired", aks holda "Active"
      const status = endDate && endDate.getTime() < today.getTime() ? 'Expired' : 'Active';

      return {
        id: index + 1 + (page - 1) * limit,
        student_name: fullName,
        email: student.user?.email ?? null,
        group_name: student.group?.name ?? null,
        start_date: student.user?.created_at ?? null,
        end_date: endDate ?? null,
        days_remaining: daysRemaining,
        status,
        avatar_url: student.user?.avatar_url ?? null,
      };
    });

    return { ...students, items: mappedItems };
  }

  async getAdminDashboardStats() {
    const [total_students, active_groups, total_teachers, blocked_users] = await Promise.all([
      this.studentRepository.getTotalStudents(),
      this.studentRepository.getActiveGroups(),
      this.studentRepository.getTotalTeachers(),
      this.studentRepository.getBlockedUsers(),
    ]);

    return {
      total_students,
      active_groups,
      total_teachers,
      blocked_users,
    };
  }

  async getProfile(studentId: string) {
    const student = await this.studentRepository.getProfile(studentId);

    if (!student) throw new NotFoundException('Student not found');

    const fullName = `${student.user?.first_name ?? ''} ${student.user?.last_name ?? ''}`.trim();

    const mainTeacher = student.group?.mentor
      ? `${student.group.mentor.user?.first_name ?? ''} ${student.group.mentor.user?.last_name ?? ''}`.trim()
      : null;

    const assistantTeacher = student.group?.assistant
      ? `${student.group.assistant.user?.first_name ?? ''} ${student.group.assistant.user?.last_name ?? ''}`.trim()
      : null;

    return {
      full_name: fullName,
      phone_number: student.user?.phone ?? null,
      avatar_url: student.user?.avatar_url ?? null,
      status: student.status,
      level: student.group?.level?.level ?? null,
      group_id: student.group?.id ?? null,
      group_name: student.group?.name ?? null,
      main_teacher: mainTeacher,
      assistant_teacher: assistantTeacher || null,
      payment_expiry: student.access_expires_at ?? null,
    };
  }

  // 2. Rankings — o'z guruhidagi barcha studentlar reytingi
  async getRankings(studentId: string) {
    const student = await this.studentRepository.getProfile(studentId);
    if (!student || !student.group_id) {
      throw new NotFoundException('Student or group not found');
    }

    const groupStudents = await this.studentRepository.getGroupStudentsWithPoints(student.group_id);

    // har bir student uchun total_points hisoblash
    const withPoints = groupStudents.map((s: any) => ({
      id: s.id,
      avatar_url: s.user?.avatar_url ?? null,
      full_name: `${s.user?.first_name ?? ''} ${s.user?.last_name ?? ''}`.trim(),
      total_points: this.calcTotalPoints(s.attendances, s.assignment_submissions),
      is_current_student: s.id === studentId,
    }));

    // ballar bo'yicha kamayish tartibida saralash va rank berish
    withPoints.sort((a, b) => b.total_points - a.total_points);

    return withPoints.map((s, index) => ({
      ...s,
      rank: index + 1,
    }));
  }

  // 3. Stats — o'zining statistikasi
  async getStats(studentId: string) {
    const student = await this.studentRepository.getProfile(studentId);
    if (!student || !student.group_id) {
      throw new NotFoundException('Student or group not found');
    }

    const data = await this.studentRepository.getStudentAttendancesAndSubmissions(studentId, student.group_id);

    const attendances = data?.attendances ?? [];
    const submissions = data?.assignment_submissions ?? [];

    // attendance_rate
    const totalLessons = attendances.length;
    const presentCount = attendances.filter((a) => a.is_present === true).length;
    const attendance_rate = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 0;

    // average_assignment_score
    const scoredSubmissions = submissions.filter((s) => s.score !== null);
    const avgScore =
      scoredSubmissions.length > 0
        ? scoredSubmissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / scoredSubmissions.length
        : 0;

    // total_points
    const total_points = this.calcTotalPoints(attendances, submissions);

    // group_rank — guruhda necha o'rinda turadi
    const groupStudents = await this.studentRepository.getGroupStudentsWithPoints(student.group_id);

    const allPoints = groupStudents
      .map((s: any) => ({
        id: s.id,
        total_points: this.calcTotalPoints(s.attendances, s.assignment_submissions),
      }))
      .sort((a, b) => b.total_points - a.total_points);

    const group_rank = allPoints.findIndex((s) => s.id === studentId) + 1;

    return {
      group_rank,
      attendance_rate,
      total_lessons_attended: presentCount,
      average_assignment_score: avgScore.toFixed(2),
      total_points,
    };
  }

  async getStudentStatusStats() {
    return this.studentRepository.getStudentStatusStats();
  }

  async getStudentsForAddingToGroup() {
    return await this.studentRepository.getStudentsForAddingToGroup();
  }

  async findOne(id: string) {
    return await this.studentRepository.findOne(id);
  }

  async create(data: CreateStudentDto) {
    const { user, student } = this.destructStudentObject(data);
    const new_user = await this.userService.create({
      ...user,
      role: Role.student,
    });
    const new_student = await this.studentRepository.create({
      ...student,
      user_id: new_user.id,
    });
    await this.studentStatusService.changeStatusToNew(new_student.id);
    return new_student;
  }

  async update(data: UpdateStudentDto, id: string, file: Express.Multer.File) {
    const student: any = await this.studentRepository.findOne(id);

    const user_data = pickFields(data, this.USER_FIELDS);
    const student_data = pickFields(data, this.STUDENT_FIELDS);

    if (file) {
      const file_res = await this.fileService.upload(
        file,
        { is_active: true, folder: 'student-avatars' },
        student.user?.avatar_id,
      );
      user_data.avatar_url = file_res.url;
      user_data.avatar_id = file_res.id;
    }

    await Promise.all([
      Object.keys(user_data).length && this.userService.update(student.user_id, user_data),

      Object.keys(student_data).length && this.studentRepository.update(id, student_data),
    ]);

    return this.findOne(id);
  }

  async delete(id: string) {
    return await this.studentRepository.delete(id);
  }

  async extendAccess(student_id: string, months: number): Promise<void> {
    const student = await this.studentRepository.findOne(student_id);
    if (!student) throw new NotFoundException('Student not found');

    const now = new Date();
    const currentExpiry = student.access_expires_at ? new Date(student.access_expires_at) : null;

    let newExpiry: Date;

    if (currentExpiry && currentExpiry > now) {
      // Hali expire bo'lmagan → mavjud sanaga qo'sh
      newExpiry = new Date(currentExpiry);
    } else {
      // Expire bo'lib ketgan yoki null → bugundan hisobla
      await this.studentStatusService.changeStatus(student_id, {
        to_status: StudentStatus.active,
      });
      newExpiry = new Date(now);
    }

    newExpiry.setMonth(newExpiry.getMonth() + months);

    await this.studentRepository.update(student_id, {
      access_expires_at: newExpiry,
    });
  }

  destructStudentObject(data) {
    const access_expires_at = data?.month ? this.addMonthsToNow(data.month) : null;
    const student = {
      address: data.address,
      job: data.job,
      telegram: data.telegram,
      access_expires_at: access_expires_at,
    };
    const user = {
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      gender: data.gender,
    };
    return { user, student };
  }

  addMonthsToNow(months: number): Date {
    const now = new Date();
    const result = new Date(now);

    result.setMonth(result.getMonth() + months);

    return result;
  }

  calcTotalPoints(attendances: { is_present: boolean | null }[], submissions: { score: number | null }[]): number {
    const attendancePoints = attendances.filter((a) => a.is_present === true).length;
    const submissionPoints = submissions.reduce((sum, s) => sum + (s.score ?? 0), 0);
    return attendancePoints + submissionPoints;
  }
}
