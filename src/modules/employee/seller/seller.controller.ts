import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req } from '@nestjs/common';
import { CreateSellerDto, UpdateSellerDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';

@ApiTags('Seller')
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  @ApiOperation({ summary: 'Method: get all' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.sellerService.findAll();
  }

  @Get('/amocrm-users')
  @ApiOperation({ summary: 'Method: get amocrm users' })
  @HttpCode(HttpStatus.OK)
  async getAmocrmUsers() {
    return await this.sellerService.getAmocrmUsers();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Method: get one' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.sellerService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Method: create' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateSellerDto) {
    return await this.sellerService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Method: update' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() data: UpdateSellerDto, @Req() req) {
    return await this.sellerService.update(data, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Method: delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.sellerService.delete(id);
  }
}
