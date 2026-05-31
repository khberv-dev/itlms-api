import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Assignment')
@Controller('assignment')
export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  @Get('/mentor')
  @ApiOperation({ summary: 'Method: get mentor assignments' })
  getMentorAssignments(@Req() req, @Query('groupId') group_id: string) {
    return this.assignmentService.getMentorAssignments(req.user.id, group_id);
  }

  @Get('groups/:group_id/grades')
  @ApiOperation({ summary: 'Group students ranking list' })
  async getGroupGrades(@Param('group_id') group_id: string) {
    return this.assignmentService.getGroupGrades(group_id);
  }

  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Method: creates new lesson home task' })
  @UseInterceptors(FilesInterceptor('files', 10, {}))
  @HttpCode(HttpStatus.CREATED)
  async createLessonHomeTask(
    @Body() data: CreateAssignmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req,
  ) {
    return this.assignmentService.createAssignment(req.user.id, data, files);
  }

  @Post('submit')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Method: submit assignment' })
  @UseInterceptors(FilesInterceptor('files', 10, {}))
  @HttpCode(HttpStatus.CREATED)
  submit(@Req() req, @Body() dto: SubmitAssignmentDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    return this.assignmentService.submitAssignment(req.user.id, dto, files);
  }

  @Patch('grade/:submissionId')
  @ApiOperation({ summary: 'Method: grade submission' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        percentage: {
          type: 'string',
          example: '80',
          description: 'Grade percentage',
        },
        comment: {
          type: 'string',
          example: 'comment',
          description: 'Comment',
        },
      },
      required: ['percentage'],
    },
  })
  grade(@Param('submissionId') submissionId: string, @Body() dto) {
    return this.assignmentService.gradeSubmission(submissionId, dto.percentage, dto.comment);
  }

  @Get('student')
  @ApiOperation({ summary: 'Method: get student assignments' })
  async getStudentAssignments(@Req() req) {
    return await this.assignmentService.getStudentAssignments(req.user.id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Method: get assignment submissions' })
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentService.getAssignmentSubmissions(assignmentId);
  }
}
