import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdministrationService } from './administration.service';
import { CreateAdministrationDto, UpdateAdministrationDto } from './dto';

@ApiTags('Administration')
@Controller('administration')
export class AdministrationController {
    constructor(private readonly administrationService: AdministrationService) { }

    @Get()
    @ApiOperation({ summary: 'Method: get all' })
    @HttpCode(HttpStatus.OK)
    async findAll() {
        return await this.administrationService.findAll();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Method: get one' })
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return await this.administrationService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Method: create' })
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() data: CreateAdministrationDto) {
        return await this.administrationService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Method: update' })
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() data: UpdateAdministrationDto, @Req() req) {
        return await this.administrationService
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Method: delete' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return await this.administrationService.delete(id);
    }
}
