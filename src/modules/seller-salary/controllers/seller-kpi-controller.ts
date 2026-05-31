// seller-kpi.controller.ts
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { SellerKpiService } from '../services/seller-kpi.service';
import { SellerDailyKpiRepository } from '../repositories/seller-daily-kpi.repository';

@Controller('seller-kpi')
export class SellerKpiController {
  constructor(
    private readonly kpiService: SellerKpiService,
    private readonly dailyRepo: SellerDailyKpiRepository,
  ) {}

  // ─── Sotuvchi KPI bali (joriy oy yoki belgilangan oy) ───────
  @Get(':seller_id/score')
  async getScore(@Param('seller_id') seller_id: string, @Query('year') year?: string, @Query('month') month?: string) {
    return this.kpiService.calculateSellerKpiScore(seller_id, year ? +year : undefined, month ? +month : undefined);
  }

  // ─── Barcha sotuvchilarning KPI ballari ──────────────────────
  @Get('all/score')
  async getAllScores(@Query('year') year?: string, @Query('month') month?: string) {
    return this.kpiService.calculateAllSellersKpiScore(year ? +year : undefined, month ? +month : undefined);
  }

  // ─── QA passni menejer qo'lda kiritadi ──────────────────────
  // PATCH /seller-kpi/:seller_id/qa
  // body: { date: "2025-02-17", qa_passed: true }
  @Patch(':seller_id/qa')
  async updateQa(@Param('seller_id') seller_id: string, @Body() body: { date: string; qa_passed: boolean }) {
    const date = new Date(body.date);
    return this.dailyRepo.upsert({
      seller_id,
      date,
      qa_passed: body.qa_passed,
    });
  }

  // ─── Manual: oy boshida rekordlar yaratish (test uchun) ─────
  @Get('init-month')
  async initMonth(@Query('year') year?: string, @Query('month') month?: string) {
    // Bu endpoint odatda cron bilan ishlaydi,
    // lekin manual test uchun qoldirildi
    return this.kpiService.initMonthKpi();
  }
}
