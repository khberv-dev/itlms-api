import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { CreateAttendanceDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Method: get all' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.attendanceService.findAll();
  }

  @Get('/student')
  @ApiOperation({ summary: 'Method: get student attendance' })
  @HttpCode(HttpStatus.OK)
  async getStudentAttendance(@Req() req) {
    return await this.attendanceService.getStudentAttendance(req.user.id);
  }

  @Get('/group-students/:group_id')
  @ApiOperation({ summary: 'Method: get one' })
  @HttpCode(HttpStatus.OK)
  async getGroupStudentsForAttendance(@Param('group_id') group_id: string) {
    return await this.attendanceService.getGroupStudentsForAttendance(group_id);
  }

  @Get('/group/:group_id/date/:date')
  @ApiOperation({ summary: 'Method: get attendance by group and date' })
  @HttpCode(HttpStatus.OK)
  async getAttendanceByGroupAndDate(@Param('group_id') group_id: string, @Param('date') date: string) {
    return await this.attendanceService.getAttendanceByGroupAndDate(group_id, date);
  }

  @Post()
  @ApiOperation({ summary: 'Method: create' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateAttendanceDto, @Req() req) {
    return await this.attendanceService.createAttendance(req.user.id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Method: delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.attendanceService.delete(id);
  }
}
