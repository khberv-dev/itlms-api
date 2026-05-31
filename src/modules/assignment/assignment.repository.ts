import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.assignmentCreateInput) {
    return this.prisma.assignment.create({
      data,
    });
  }

  async getStudentAssignments(studentId: string) {
    return this.prisma.assignment.findMany({
      where: {
        group: {
          students: {
            some: { id: studentId },
          },
        },
      },
      include: {
        submissions: {
          where: { student_id: studentId },
          include: {
            files: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      orderBy: { due_date: 'desc' },
    });
  }

  async getMentorAssignments(mentor_id: string, group_id: string) {
    const where = [Prisma.sql`a.mentor_id = ${mentor_id}`];

    if (group_id) {
      where.push(Prisma.sql`a.group_id = ${group_id}`);
    }
    return this.prisma.$queryRaw<
      {
        id: string;
        title: string;
        group_name: string;
        due_date: Date;
        submissions_count: number;
        students_count: number;
        waiting_for_review: number;
        status: string;
      }[]
    >`
           SELECT
             a.id,
             a.title,
             g.name as group_name,
             a.due_date,
             a.status,
     
             COUNT(DISTINCT s.id) as submissions_count,
     
             COUNT(DISTINCT gs.student_id) FILTER (WHERE gs.left_at IS NULL) as students_count,
     
             COUNT(DISTINCT s.id) FILTER (WHERE s.score IS NULL) as waiting_for_review
     
           FROM assignment a
     
           LEFT JOIN "group" g
           ON g.id = a.group_id
     
           LEFT JOIN assignment_submission s
           ON s.assignment_id = a.id
     
           LEFT JOIN group_student gs
           ON gs.group_id = g.id
     
           WHERE ${Prisma.join(where, ' AND ')}
     
           GROUP BY a.id, g.name
           ORDER BY a.created_at DESC
       `;
  }

  async getGroupGrades(group_id: string) {
    return this.prisma.$queryRaw<
      {
        id: string;
        name: string;
        avatar_url: string;
        last_assignment_score: number;
        attendance_score: number;
        average_assignment: number;
        rank: number;
      }[]
    >`
        WITH last_assignment AS (
          SELECT id
          FROM assignment
          WHERE group_id = ${group_id}
          ORDER BY created_at DESC
          LIMIT 1
        ),
        
        student_stats AS (
          SELECT
            st.id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            COALESCE(u.avatar_url, '') as avatar_url,
        
            -- last assignment score
            COALESCE((
              SELECT s.score
              FROM assignment_submission s
              WHERE s.assignment_id = (SELECT id FROM last_assignment)
              AND s.student_id = st.id
              LIMIT 1
            ), 0) as last_assignment_score,
        
            -- attendance score
            COUNT(a.id) FILTER (WHERE a.is_present = true) as attendance_score,
        
            -- average assignment
            COALESCE(AVG(sub.score), 0) as average_assignment
        
          FROM group_student gs
        
          JOIN student st ON st.id = gs.student_id
          JOIN "user" u ON u.id = st.user_id
        
          LEFT JOIN attendance a
            ON a.student_id = st.id
            AND a.group_id = ${group_id}
        
          LEFT JOIN assignment ass
            ON ass.group_id = ${group_id}
        
          LEFT JOIN assignment_submission sub
            ON sub.assignment_id = ass.id
            AND sub.student_id = st.id
            AND sub.score IS NOT NULL
        
          WHERE gs.group_id = ${group_id}
            AND gs.left_at IS NULL
        
          GROUP BY st.id, u.id
        )
        
        SELECT *,
          RANK() OVER (ORDER BY average_assignment DESC) as rank
        FROM student_stats
        ORDER BY average_assignment DESC;
    `;
  }

  findAssignmentById(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            files: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });
  }

  createSubmission(data) {
    return this.prisma.assignment_submission.create({
      data,
    });
  }

  gradeSubmission(id: string, score: number, percentage: number, comment: string) {
    return this.prisma.assignment_submission.update({
      where: { id },
      data: {
        score,
        percentage,
        reviewed_at: new Date(),
        comment,
      },
    });
  }
}
