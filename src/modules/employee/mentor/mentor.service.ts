import { Injectable } from '@nestjs/common';

import { MentorRepository } from './mentor.repository';
import { UserService } from 'src/modules/user/user.service';
import { Role } from '@prisma/client';
import { CreateMentorDto, UpdateMentorDto } from './dto';
import { pickFields } from 'src/common/helpers';

@Injectable()
export class MentorService {
  constructor(
    private readonly mentorRepository: MentorRepository,
    private readonly userService: UserService,
  ) {}
  private USER_FIELDS = ['first_name', 'last_name', 'phone', 'birthday', 'role', 'email'];
  private MENTOR_FIELDS = [];

  async findAll() {
    const mentors = await this.mentorRepository.findAll();

    return mentors.map((mentor: any) => {
      const mainGroupsCount = mentor.mentor_groups.length;
      const assistantGroupsCount = mentor.assistant_groups.length;
      const assignedGroupsCount = mainGroupsCount + assistantGroupsCount;

      // position: ikkalasi ham bo'lsa "Main" ustunlik qiladi
      let position: string;
      if (mentor?.user?.role === Role.mentor) {
        position = 'Main';
      } else {
        position = 'Assistant';
      }

      const fullName = `${mentor.user?.first_name ?? ''} ${mentor.user?.last_name ?? ''}`.trim();

      return {
        id: mentor.id,
        avatar_url: mentor.user?.avatar_url ?? null,
        name: fullName,
        phone: mentor.user?.phone ?? null,
        role: mentor.user?.role ?? null,
        email: mentor.user?.email ?? null,
        position,
        created_at: mentor.user?.created_at ?? null,
        main_groups: String(mainGroupsCount),
        assistant_groups: String(assistantGroupsCount),
        assigned_groups_count: assignedGroupsCount,
        user_id: mentor.user_id,
      };
    });
  }

  async findOne(id: string) {
    const user = await this.mentorRepository.findOne(id);
    return user;
  }

  async getMentorGroups(mentor_id: string, role) {
    const groups = await this.mentorRepository.findMentorGroups(mentor_id);

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      level: group.level?.level ?? null,
      student_count: group.students.length,
      teacher_role: role,
      status: group.status,
      max_students: group?.max_students ?? null,
      created_at: group.created_at,
    }));
  }

  async getMentorStatistics(mentor_id: string) {
    const [groups_count, total_students, active_assignments, pending_reviews] = await Promise.all([
      this.mentorRepository.getGroupsCount(mentor_id),
      this.mentorRepository.getTotalStudentsCount(mentor_id),
      this.mentorRepository.getActiveAssignmentsCount(mentor_id),
      this.mentorRepository.getPendingReviewsCount(mentor_id),
    ]);

    return {
      groups_count,
      total_students,
      active_assignments,
      pending_reviews,
    };
  }

  async create(data: CreateMentorDto) {
    const role = data.role == 'mentor' ? Role.mentor : Role.assistant;
    const user = await this.userService.create({ ...data, role });
    await this.mentorRepository.create({ user_id: user.id });
    return user;
  }

  async update(data: UpdateMentorDto, id: string) {
    const mentor: any = await this.mentorRepository.findOne(id);

    const user_data = pickFields(data, this.USER_FIELDS);
    const mentor_data = pickFields(data, this.MENTOR_FIELDS);

    await Promise.all([
      Object.keys(user_data).length && this.userService.update(mentor.user_id, user_data),

      Object.keys(mentor_data).length && this.mentorRepository.update(id, mentor_data),
    ]);

    return this.findOne(id);
  }

  async delete(id: string) {
    return await this.mentorRepository.delete(id);
  }
}
