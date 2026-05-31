import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { GroupSnapshotService } from './group_monthly_snapshot.service';

import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { GroupSnapshotStatsQueryDto } from './dto/get-stats.dto';

class TriggerSnapshotDto {
  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 3, description: '1-12' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    example: 'full',
    description: "full = to'liq oy | h1 = 1-15 | h2 = 16-oxir",
    enum: ['full', 'h1', 'h2'],
    default: 'full',
  })
  @IsOptional()
  @IsIn(['full', 'h1', 'h2'])
  period?: 'full' | 'h1' | 'h2';
}

@ApiTags('Group Snapshot (Retention / Churn / LTV)')
@Controller('group-snapshots')
export class GroupSnapshotController {
  constructor(private readonly snapshotService: GroupSnapshotService) {}

  // POST /snapshots/trigger
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Snapshot hisoblashni qo'lda ishga tushirish (admin)",
    description: `
      Berilgan yil/oy/period uchun barcha guruhlar snapshotini hisoblaydi.
      period: full (to'liq oy) | h1 (1-15) | h2 (16-oy oxiri)
    `,
  })
  trigger(@Body() dto: TriggerSnapshotDto) {
    return this.snapshotService.triggerCalculation(dto.year, dto.month, dto.period ?? 'full');
  }

  @Get('stats')
  @ApiOperation({
    summary: 'return: retention/churn/ltv',
  })
  async getStats(@Query() query: GroupSnapshotStatsQueryDto) {
    return await this.snapshotService.getStats(query);
  }

  @Get('company/month-by-month')
  @ApiOperation({
    summary: 'return: retention/churn/ltv',
  })
  async getCompanyStatMonthByMonth(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return await this.snapshotService.getCompanyTrend({ start_date, end_date });
  }

  @Get('mentor/rating')
  @ApiOperation({
    summary: 'return: retention/churn/ltv',
  })
  async getMentorsRating(@Query('start_date') start_date: string, @Query('end_date') end_date: string) {
    return await this.snapshotService.getMentorsStats({ start_date, end_date });
  }
}
