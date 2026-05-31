import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { CreateMentorDto, UpdateMentorDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorService } from './mentor.service';

@ApiTags('Mentor')
@Controller('mentor')
export class MentorController {
    constructor(private readonly mentorService: MentorService) { }

    @Get()
    @ApiOperation({ summary: 'Method: get all' })
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return await this.mentorService.findAll();
    }

    @Get('/stats')
    @ApiOperation({ summary: 'Mentor statistikasi'})
    async getMentorStatistics(@Req() req){
        return await this.mentorService.getMentorStatistics(req.user.id);
    }

    @Get('/groups')
    @ApiOperation({ summary: 'Get mentor groups' })
    async getMyGroups(@Req() req) {
        return await this.mentorService.getMentorGroups(req.user.id, req.user.role);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Method: get one' })
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return await this.mentorService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Method: create' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() data: CreateMentorDto) {
        return await this.mentorService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Method: update' })
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() data: UpdateMentorDto, @Req() req) {
        return await this.mentorService.update(data, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Method: delete' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return await this.mentorService.delete(id);
    }
}
