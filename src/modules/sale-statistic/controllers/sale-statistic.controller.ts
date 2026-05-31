import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SaleStatisticService } from '../service/sale-statistic.service';

@ApiTags('Sale-Statistic')
@Controller('sale-statistic')
export class SaleStatisticController {
  constructor(private readonly saleStatisticService: SaleStatisticService) {}

  @Get('/sum')
  @ApiOperation({ summary: 'Method: calculate monthly sale statistic' })
  @HttpCode(HttpStatus.OK)
  async calculateSaleStatisticByMonth() {
    return await this.saleStatisticService.calculateSaleStatisticByMonth();
  }

  @Get('/seller/rating')
  @ApiOperation({ summary: 'Method: calculate sellers rating' })
  @HttpCode(HttpStatus.OK)
  async calculateSellerRating(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return await this.saleStatisticService.calculateSellersRating(start_date, end_date);
  }

  @Get('/daily-summary')
  @ApiOperation({ summary: 'Method: calculate daily sales summary' })
  @HttpCode(HttpStatus.OK)
  async calculateDailySalesSummary(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return await this.saleStatisticService.getDailySalesSummary(start_date, end_date);
  }

  @Get('/yearly-summary')
  @ApiOperation({ summary: 'Method: calculate yearly sales summary' })
  @HttpCode(HttpStatus.OK)
  async calculateYearlySummary(@Query('year') year: string) {
    return await this.saleStatisticService.getYearlyDynamics(+year);
  }

  @Get('monthly-conversion')
  getMonthlyConversion(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return this.saleStatisticService.getMonthlyConversion(start_date, end_date);
  }

  @Get('sales-by-address')
  getSalesByAddress(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return this.saleStatisticService.getSalesByAddress(start_date, end_date);
  }

  @Get('sales-by-job')
  getSalesByJob(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return this.saleStatisticService.getSalesByJob(start_date, end_date);
  }

  @Get('sellers-average-check')
  getSellersByAverageCheck(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return this.saleStatisticService.getSellersByAverageCheck(start_date, end_date);
  }

  @Get('sellers-lead-pipeline')
  getSellers(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return {
      lead_assigned: 40,
      lead_qualified: 30,
      lead_proposal: 20,
      lead_closed: 10,
    };
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'top performers' })
  async getTopPerformers(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return this.saleStatisticService.getTopPerformers(start_date, end_date);
  }
}
