import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentFrozenService } from './student-frozen.service';
import { CreateFrozenDto, FrozenListQueryDto } from './dto/student-frozen.dto';

@ApiTags('Student Frozen')
@Controller()
export class StudentFrozenController {
  constructor(private readonly frozenService: StudentFrozenService) {}

  // POST /students/:student_id/frozen
  @Post('students/:student_id/frozen')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Studentni muzlatish',
    description: `
      Studentni muzlatadi:
      - Student "frozen" statusiga o'tadi (student_status tarixiga yoziladi)
      - access_expires_at muzlagan muddatga suriladi
      - course_dislike sababi => retention'ga ta'sir qiladi
    `,
  })
  @ApiParam({ name: 'student_id', description: 'Student UUID' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli muzlatildi' })
  @ApiResponse({
    status: 400,
    description: 'Student active emas yoki allaqachon muzlatilgan',
  })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  async freeze(
    @Param('student_id', ParseUUIDPipe) student_id: string,
    @Body() dto: CreateFrozenDto,
    @Request() req: any,
  ) {
    return await this.frozenService.freeze(student_id, dto, req.user.user_id);
  }

  // PATCH /students/:student_id/frozen/unfreeze
  @Patch('students/:student_id/frozen/unfreeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Muzlatishni tugatish',
    description: `
      Studentning aktiv muzlatishini tugatadi:
      - Student "active" statusiga qaytadi
      - student_status tarixiga yoziladi
    `,
  })
  @ApiParam({ name: 'student_id', description: 'Student UUID' })
  @ApiResponse({
    status: 200,
    description: 'Muzlatish muvaffaqiyatli tugatiland',
  })
  @ApiResponse({ status: 400, description: 'Aktiv muzlatish topilmadi' })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  async unfreeze(@Param('student_id', ParseUUIDPipe) student_id: string, @Request() req: any) {
    return await this.frozenService.unfreeze(student_id, req.user.user_id);
  }

  // GET /students/:student_id/frozen/history
  @Get('students/:student_id/frozen/history')
  @ApiOperation({
    summary: 'Student muzlatish tarixini olish',
    description: 'Studentning barcha muzlatish yozuvlarini qaytaradi',
  })
  @ApiParam({ name: 'student_id', description: 'Student UUID' })
  @ApiResponse({ status: 200, description: 'Muzlatish tarixi' })
  @ApiResponse({ status: 404, description: 'Student topilmadi' })
  async getHistory(@Param('student_id', ParseUUIDPipe) student_id: string) {
    return await this.frozenService.getStudentFrozenHistory(student_id);
  }

  // GET /frozen?start_date=2024-03-01&end_date=2024-03-31
  @Get('frozen')
  @ApiOperation({
    summary: 'Barcha muzlatishlar listini olish (admin)',
    description: "Berilgan sana oralig'ida boshlangan yoki davom etayotgan muzlatishlar",
  })
  @ApiQuery({
    name: 'start_date',
    example: '2024-03-01',
    description: 'Boshlanish sanasi',
  })
  @ApiQuery({
    name: 'end_date',
    example: '2024-03-31',
    description: 'Tugash sanasi',
  })
  @ApiResponse({ status: 200, description: 'Muzlatishlar listi' })
  @ApiResponse({ status: 400, description: "Noto'g'ri sana oralig'i" })
  async getAllFrozen(@Query() query: FrozenListQueryDto) {
    return await this.frozenService.getAllFrozenByDateRange(query);
  }
}
