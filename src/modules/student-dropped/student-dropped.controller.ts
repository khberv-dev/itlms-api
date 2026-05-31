import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StudentDroppedService } from './student-dropped.service';
import { CreateDroppedDto, DroppedListQueryDto } from './dto/student-dropped.dto';

@ApiTags('Student Dropped')
@Controller('student-dropped')
export class StudentDroppedController {
  constructor(private readonly droppedService: StudentDroppedService) { }

  // POST /students/:student_id/drop
  @Post('students/:student_id/drop')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Studentni o\'qishdan chiqarish',
    description: `
      Admin tomonidan to'ldiriladi.
      - Student "blocked" statusiga o'tadi
      - Guruhdan chiqariladi (group_student.left_at = now)
      - student_status tarixiga yoziladi (affects_retention = true)
    `,
  })
  @ApiParam({ name: 'student_id', description: 'Student UUID' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli chiqarildi' })
  @ApiResponse({ status: 400, description: 'Student dropped qilib bo\'lmaydigan statusda' })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  drop(
    @Param('student_id', ParseUUIDPipe) student_id: string,
    @Body() dto: CreateDroppedDto,
    @Request() req: any,
  ) {
    return this.droppedService.drop(student_id, dto, req.user.user_id);
  }

  @Get('count-by-dropped-reasons')
   @ApiOperation({
    summary: 'count by reason',
  })
  async getDroppedReasons(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    return await this.droppedService.getDroppedReasonCounts(start_date, end_date);
  }
}