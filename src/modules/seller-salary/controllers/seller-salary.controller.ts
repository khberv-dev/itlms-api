import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerSalaryService } from '../services/seller-salary.service';

@ApiTags('Seller-Salary')
@Controller('seller-salary')
export class SellerSalaryController {
  constructor(private readonly sellerSalaryService: SellerSalaryService) {}

  @Get('/:seller_id')
  @ApiOperation({ summary: 'Method: calculate seller salary' })
  @HttpCode(HttpStatus.OK)
  async calculateSellerTalkAndContactsSummary(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Param('seller_id') seller_id: string,
  ) {
    return await this.sellerSalaryService.calculateSellerSalary(
      seller_id,
      new Date(start_date).getMonth() + 1,
      new Date(start_date).getFullYear(),
    );
  }
}
