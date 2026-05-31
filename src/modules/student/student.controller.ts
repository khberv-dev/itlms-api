import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus, Req, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CreateStudentDto, GetStudentFilterDto, UpdateStudentDto } from './dto';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Student')
@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get()
    @ApiOperation({ summary: 'Method: get all' })
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: GetStudentFilterDto) {
        return await this.studentService.findAll(query);
    }

    @Get('all-for-admin')
    @ApiOperation({
        summary: 'Get all students (paginated)'
    })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    async getStudents(
        @Query() filter: GetStudentFilterDto
    ) {
        return await this.studentService.getStudentsForAdmin(filter, +filter?.page || 1, +filter?.limit || 10);
    }

    @Get('expiry')
    @ApiOperation({ summary: 'Get students expiry list (paginated)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'filter', required: false, example: 'active' })
    async getStudentsExpiry(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('filter') filter?: 'active' | 'expired' | '7'
    ) {
        return await this.studentService.getStudentsExpiry(+page, +limit, filter);
    }

    @Get('dashboard-stats')
    @ApiOperation({
        summary: 'Get dashboard statistics'
    })
    async getDashboardStats() {
        return await this.studentService.getAdminDashboardStats();
    }

    @Get('status-stats')
    @ApiOperation({
        summary: 'Get student status statistics',
    })
    async getStudentStatusStats() {
        return await this.studentService.getStudentStatusStats();
    }

    @Get('profile')
    @ApiOperation({ summary: 'Method: get profile' })
    async getProfile(@Req() req) {
        return await this.studentService.getProfile(req.user.id);   
    }

    @Get('rankings')
    @ApiOperation({ summary: 'Method: get rankings' })
    async getRankings(@Req() req, @Query('type') type: string) {
        return await this.studentService.getRankings(req.user.id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Method: get stats' })
    async getStats(@Req() req) {
        return await this.studentService.getStats(req.user.id);
    }

    @Get('for-adding-to-group')
    @ApiOperation({ summary: 'Method: get students for adding to group' })
    async getStudentsForAddingToGroup() {
        return await this.studentService.getStudentsForAddingToGroup();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Method: get one' })
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return await this.studentService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Method: create' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() data: CreateStudentDto) {
        return await this.studentService.create(data);
    }

    @Put(':id')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Method: update' })
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
    FileInterceptor('avatar', {}),
  )
    async update(
        @Param('id') id: string, 
        @Body() data: UpdateStudentDto, 
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.studentService.update(data, id,file);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Method: delete' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return await this.studentService.delete(id);
    }
}
