import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentStatusService } from './studnet-status.service'
import { ChangeStudentStatusDto } from './dto/student-status.dto';

@ApiTags('Student Status')
@Controller('students-status')
export class StudentStatusController {
  constructor(private readonly studentStatusService: StudentStatusService) { }

  @Post('/:student_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Student statusini o\'zgartirish',
  })
  @ApiParam({ name: 'student_id', description: 'Student UUID' })
  async changeStatus(
    @Param('student_id', ParseUUIDPipe) student_id: string,
    @Body() dto: ChangeStudentStatusDto,
    @Request() req: any,
  ) {
    return await this.studentStatusService.changeStatus(
      student_id,
      dto,
      req.user?.user_id,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Student status tarixini olish',
    description: 'Studentning barcha status o\'zgarishlari tarixini qaytaradi (yangiidan eskiga)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'student_id', required: false, example: 'uuid' })
  async getHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('student_id') student_id:string
  ) {
    return await this.studentStatusService.getStudentStatusHistory(+page || 1,+limit || 10,student_id);
  }

  @Get('status-counts')
  @ApiOperation({
    summary: 'Student status tarixini olish',
  })
  async getStatusCounts(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
  ) {
    return await this.studentStatusService.getStatusCounts(start_date, end_date);
  }
}