import { Injectable } from '@nestjs/common';
import { AssignmentRepository } from './assignment.repository';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto';
import { FileService } from '../file/file.service';

@Injectable()
export class AssignmentService {
  constructor(
    private repository: AssignmentRepository,
    private readonly fileService: FileService,
  ) {}

  async createAssignment(mentorId: string, dto: CreateAssignmentDto, files: Array<Express.Multer.File>) {
    let file_ids: string[] = [];
    if (files?.length) {
      const uploadedFiles = await this.fileService.uploadMany(files, {
        folder: 'assignment',
        is_active: true,
      });
      file_ids = uploadedFiles.map((f) => f.id);
    }

    return this.repository.create({
      title: dto.title,
      description: dto.description,
      due_date: new Date(dto.due_date),

      mentor: {
        connect: { id: mentorId },
      },

      group: {
        connect: { id: dto.group_id },
      },
      files: {
        connect: file_ids.map((file_id) => ({ id: file_id })),
      },
    });
  }

  async getMentorAssignments(mentor_id: string, group_id: string) {
    const assignments = await this.repository.getMentorAssignments(mentor_id, group_id);

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      group_name: a.group_name,
      due_date: a.due_date,
      submission_ratio: `${a.submissions_count}/${a.students_count}`,
      waiting_for_review: Number(a.waiting_for_review),
      status: a.status,
    }));
  }

  async getAssignments(studentId: string) {
    const assignments = await this.repository.getStudentAssignments(studentId);

    const items = assignments.map((assignment: any) => {
      const submission = assignment.submissions?.[0] ?? null;

      // submission status aniqlash
      let status = 'not_submitted';
      if (submission) {
        status = submission.reviewed_at ? 'graded' : 'submitted';
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description ?? null,
        due_date: assignment.due_date,
        max_score: assignment.max_score,
        status: assignment.status,
        submission_status: status,
        files: assignment.files ?? [],
        submission: submission
          ? {
              id: submission.id,
              content: submission.content ?? null,
              file_url: submission.file_url ?? null,
              score: submission.score ?? null,
              percentage: submission.percentage ?? null,
              submitted_at: submission.created_at,
              reviewed_at: submission.reviewed_at ?? null,
            }
          : null,
      };
    });

    return {
      total: items.length,
      items,
    };
  }

  async getGroupGrades(group_id: string) {
    const result = await this.repository.getGroupGrades(group_id);

    return result.map((s) => ({
      ...s,
      last_assignment_score: Number(s.last_assignment_score),
      attendance_score: Number(s.attendance_score),
      average_assignment: Math.round(Number(s.average_assignment)),
      rank: Number(s.rank),
    }));
  }

  async submitAssignment(studentId: string, dto: SubmitAssignmentDto, files: Array<Express.Multer.File>) {
    let file_ids: string[] = [];
    if (files?.length) {
      const uploadedFiles = await this.fileService.uploadMany(files, {
        folder: 'assignment-submission',
        is_active: true,
      });
      file_ids = uploadedFiles.map((f) => f.id);
    }

    return this.repository.createSubmission({
      assignment: {
        connect: { id: dto.assignment_id },
      },

      student: {
        connect: { id: studentId },
      },

      content: dto.content,
      files: {
        connect: file_ids.map((file_id) => ({ id: file_id })),
      },
    });
  }

  async gradeSubmission(submissionId: string, percentage: number, comment: string) {
    const score = (percentage / 100) * 10;

    return this.repository.gradeSubmission(submissionId, score, percentage, comment);
  }

  async getAssignmentSubmissions(assignmentId: string) {
    const assignment = await this.repository.findAssignmentById(assignmentId);

    return assignment?.submissions.map((s) => ({
      id: s.id,
      student_name: s.student.user.first_name + ' ' + s.student.user.last_name,
      avatar_url: s.student.user.avatar_url,
      content: s.content,
      comment: s.comment,
      submitted_at: s.created_at,
      score: s.score,
      percentage: s.percentage,
      files: s.files,
    }));
  }

  async getStudentAssignments(studentId: string) {
    return this.repository.getStudentAssignments(studentId);
  }
}
