import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { AddStudentsToGroupDto, CreateGroupDto, UpdateGroupDto } from './dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';

@ApiTags('Group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiOperation({ summary: 'Method: get all' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('status') status?: string) {
    return await this.groupService.findAll(status);
  }

  @Get('/levels')
  @ApiOperation({ summary: 'Method: get all levels' })
  @HttpCode(HttpStatus.OK)
  async getLevels() {
    return await this.groupService.getLevels();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Method: get one' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.groupService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Method: create' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateGroupDto) {
    return await this.groupService.create(data);
  }

  @Post('/level')
  @ApiOperation({ summary: 'Method: create level' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          example: 'A1',
          description: 'level',
        },
      },
      required: ['level'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createLevel(@Body() { level }: { level: string }) {
    return await this.groupService.createLevel(level);
  }

  @Post(':group_id/students')
  @ApiOperation({ summary: 'Method: add students to group' })
  @HttpCode(HttpStatus.OK)
  async addStudentsToGroup(@Param('group_id') group_id: string, @Body() dto: AddStudentsToGroupDto) {
    return await this.groupService.addStudentsToGroup(group_id, dto);
  }

  @Post('/left-group')
  @ApiOperation({ summary: 'Method: left students from group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          example: 'group_id',
          description: 'Group ID',
        },
        student_id: {
          type: 'string',
          example: 'student_id',
          description: 'Student ID',
        },
      },
      required: ['group_id', 'student_id'],
    },
  })
  @HttpCode(HttpStatus.OK)
  async leftStudentsFromGroup(@Body('group_id') group_id: string, @Body('student_id') student_id: string) {
    return await this.groupService.leftStudentsFromGroup(group_id, student_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Method: update' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() data: UpdateGroupDto, @Req() req) {
    return await this.groupService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Method: delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.groupService.delete(id);
  }
}
