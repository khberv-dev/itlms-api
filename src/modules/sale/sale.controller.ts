import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SaleService } from './sale.service';
import CreateSaleDto from './dto/create-sale.dto';
import CreateReSaleDto from './dto/create-resale.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get()
  @ApiOperation({ summary: 'Method: get all' })
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.saleService.findAll();
  }

  @Get('/seller/:id')
  @ApiOperation({ summary: 'Method: get by seller id' })
  @HttpCode(HttpStatus.OK)
  async findBySellerId(@Param('id') id: string) {
    return await this.saleService.findBySellerId(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Method: create' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() data: CreateSaleDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.saleService.create(data, req.user.id, file);
  }

  @Post('/resale')
  @ApiOperation({ summary: 'Method: create resale' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async createResale(
    @Body() data: CreateReSaleDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.saleService.createResale(data, req.user.id, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Method: delete' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.saleService.delete(id);
  }
}
