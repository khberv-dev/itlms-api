import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerStatisticService } from '../service/seller-statistic.service';

@ApiTags('Seller-Statistic')
@Controller('seller-statistic')
export class SellerStatisticController {
    constructor(private readonly sellerStatisticService: SellerStatisticService) { }

    @Get('/sale-summary')
    @ApiOperation({ summary: 'Method: calculate seller sale summary' })
    @HttpCode(HttpStatus.OK)
    async calculateSellerSaleSummary(
        @Query('start_date') start_date: string,
        @Query('end_date') end_date: string,
        @Query('seller_id') seller_id: string) {
        return await this.sellerStatisticService.getKpiCards(seller_id, new Date(start_date), new Date(end_date));
    }

    @Get('/talk-and-contacts/:seller_id')
    @ApiOperation({ summary: 'Method: calculate seller talk and contacts summary' })
    @HttpCode(HttpStatus.OK)
    async calculateSellerTalkAndContactsSummary(
        @Query('start_date') start_date: string,
        @Query('end_date') end_date: string,
        @Param('seller_id') seller_id: string) {
        return await this.sellerStatisticService.getDailyTalkAndContacts(seller_id, new Date(start_date), new Date(end_date));
    }

    @Get('/today-activity/:seller_id')
    @ApiOperation({ summary: 'Method: calculate seller today activity summary' })
    @HttpCode(HttpStatus.OK)
    async calculateSellerTodayActivitySummary(@Param('seller_id') seller_id: string) {
        return await this.sellerStatisticService.getTodayStats(seller_id);
    }

    @Get('/sale-compare/:seller_id')
    @ApiOperation({ summary: 'Method: calculate seller sale compare summary' })
    @HttpCode(HttpStatus.OK)
    async calculateSellerSaleSummaryComparedPeriod(
        @Query('start_date') start_date: string,
        @Query('end_date') end_date: string,
        @Param('seller_id') seller_id: string) {
        return await this.sellerStatisticService.compareWithLastPeriod(seller_id, new Date(start_date), new Date(end_date));
    }
}
