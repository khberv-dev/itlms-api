import { Injectable } from '@nestjs/common';
import { AddStudentsToGroupDto, CreateGroupDto, UpdateGroupDto } from './dto';
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async findAll(status?: string) {
    const where: any = {};
    status ? (where.status = status) : null;
    const groups = await this.groupRepository.findAll(where);

    return groups.map((group: any) => {
      const mainTeacher = group.mentor
        ? `${group.mentor.user?.first_name ?? ''} ${group.mentor.user?.last_name ?? ''}`.trim()
        : null;

      const assistantTeacher = group.assistant
        ? `${group.assistant.user?.first_name ?? ''} ${group.assistant.user?.last_name ?? ''}`.trim()
        : null;

      return {
        id: group.id,
        name: group.name,
        level_id: group.level?.id ?? null,
        level: group.level?.level ?? null,
        main_teacher: mainTeacher,
        assistant_teacher: assistantTeacher || null,
        student_count: String(group._count.students),
        status: group.status,
      };
    });
  }

  async findOne(id: string) {
    return await this.groupRepository.findOne(id);
  }

  async create(data: CreateGroupDto) {
    return await this.groupRepository.create(data);
  }

  async createLevel(level: string) {
    return await this.groupRepository.createLevel(level);
  }

  async getLevels() {
    return await this.groupRepository.getLevels();
  }

  async update(id: string, data: UpdateGroupDto) {
    return await this.groupRepository.update(id, data);
  }

  async addStudentsToGroup(group_id: string, dto: AddStudentsToGroupDto) {
    return await this.groupRepository.addStudentsToGroup(group_id, dto.student_ids);
  }

  async leftStudentsFromGroup(group_id: string, student_id: string) {
    return await this.groupRepository.leftStudentsFromGroup(group_id, student_id);
  }

  async delete(id: string) {
    return await this.groupRepository.delete(id);
  }
}
