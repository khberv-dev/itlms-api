import { Injectable } from '@nestjs/common';

import { CreateAttendanceDto } from './dto';
import { AttendanceRepository } from './attendance.repository';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async findAll() {
    return await this.attendanceRepository.findAll();
  }

  async getAttendanceByGroupAndDate(groupId: string, date: string) {
    return await this.attendanceRepository.getAttendanceByGroupAndDate(groupId, date);
  }

  async getGroupStudentsForAttendance(groupId: string) {
    const students = await this.attendanceRepository.getGroupStudentsForAttendance(groupId);

    return students.map((student) => ({
      id: student.id,
      avatar: student.user.avatar_url ?? '',
      full_name: `${student.user.first_name ?? ''} ${student.user.last_name ?? ''}`.trim(),
      phone: student.user.phone,
    }));
  }

  async getStudentAttendance(studentId: string) {
    return await this.attendanceRepository.getStudentAttendance(studentId);
  }

  async createAttendance(mentor_id: string, dto: CreateAttendanceDto) {
    const attendanceDate = new Date(dto.date);

    const data = dto.attendance.map((item) => ({
      student_id: item.student_id,
      group_id: dto.group_id,
      mentor_id,
      date: attendanceDate,
      is_present: item.is_present,
    }));

    await this.attendanceRepository.createManyAttendance(data);

    return {
      message: 'Attendance successfully created',
    };
  }

  async delete(id: string) {
    return await this.attendanceRepository.delete(id);
  }
}
