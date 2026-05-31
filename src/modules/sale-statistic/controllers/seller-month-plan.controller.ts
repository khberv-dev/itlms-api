import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SellerMonthPlanService } from '../service/seller-mont-plan.service';

@ApiTags('Seller-Month-Plan')
@Controller('seller-month-plan')
export class SellerMonthPlanController {
  constructor(private readonly sellerMonthPlanService: SellerMonthPlanService) { }

  @Get('/:seller_id')
  @ApiOperation({ summary: 'Method: get seller month plan sum' })
  @HttpCode(HttpStatus.OK)
  async getMonthlyPlanSum(@Query('date') date: string, @Param('seller_id') seller_id: string) {
    return await this.sellerMonthPlanService.getMonthlyPlanSum(date, seller_id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Method: set seller month plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        plan: {
          type: 'number',
          example: 5000000,
          description: 'Set monthly seller plan amount',
        },
        seller_id: {
          type: 'string',
          example: 'uuid',
          description: 'ID of the seller',
        },
        start_date: {
          type: 'string',
          example: '2024-01-01',
          description: 'Start date of the plan period',
        },
        end_date: {
          type: 'string',
          example: '2024-01-31',
          description: 'End date of the plan period',
        },
      },
      required: ['plan', 'seller_id', 'start_date', 'end_date'],
    },
  })
  @HttpCode(HttpStatus.OK)
  async setMonthlyPlan(
    @Body('plan') plan: number,
    @Body('seller_id') seller_id: string,
    @Body('start_date') start_date: string,
    @Body('end_date') end_date: string,
  ) {
    return await this.sellerMonthPlanService.setMonthlyPlan(new Date(start_date), new Date(end_date), plan, seller_id);
  }
}
