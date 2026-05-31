// seller-kpi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { SellerDailyKpiRepository } from '../repositories/seller-daily-kpi.repository';
import { SellerMonthlyKpiRepository } from '../repositories/seller-monthly-kpi.repository';
import { KPI_SCORES, LEVEL_TARGETS, SellerLevel } from './kpi.constanta';

// ─── Ball hisoblash natijasi ─────────────────────────────────
export interface KpiScoreResult {
  seller_id: string;
  year: number;
  month: number;
  calculated_at: Date;

  // Har bir kategoriya
  started_on_time_score: number; // max 10
  calls_score: number; // max 20
  talk_time_score: number; // max 15
  conversion_score: number; // max 20
  sale_sum_score: number; // max 25
  qa_score: number; // max 10

  total_score: number; // max 100

  // Qo'shimcha ma'lumotlar
  details: {
    // Kunlik ko'rsatkichlar (oyda nechta kun targetga yetdi)
    days_on_time: number;
    days_calls_done: number;
    days_talk_done: number;
    days_qa_passed: number;
    working_days: number;

    // Oylik ko'rsatkichlar
    sale_sum: bigint;
    sale_target: bigint;
    sale_completed: boolean;

    // Konversiya
    conversion_mid_pct: number | null;
    conversion_end_pct: number | null;
    conversion_target: number;
  };
}

@Injectable()
export class SellerKpiService {
  private readonly logger = new Logger(SellerKpiService.name);

  constructor(
    private readonly dailyRepo: SellerDailyKpiRepository,
    private readonly monthlyRepo: SellerMonthlyKpiRepository,
  ) {}

  // ═══════════════════════════════════════════════════════
  // 1.  OY BOSHIDA — barcha sotuvchilar uchun rekordlar yaratish
  //     Har oyning 1-kuni soat 00:05 da ishlaydi
  // ═══════════════════════════════════════════════════════
  @Cron('5 0 1 * *', { timeZone: 'Asia/Tashkent' })
  async initMonthKpi() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    this.logger.log(`[initMonthKpi] ${year}-${month} oy uchun KPI rekordlari yaratilmoqda...`);

    const sellers = await this.dailyRepo.getSellers();

    await Promise.all(
      sellers.map(async (seller) => {
        const level = (seller.level ?? 'junior') as SellerLevel;
        const targets = LEVEL_TARGETS[level];

        // ── Kunlik KPI: oyning har bir kuni uchun bo'sh rekord ──
        await this.dailyRepo.bulkCreateMonthDays(
          seller.id,
          year,
          month,
          targets.calls_per_day,
          targets.talk_time_seconds,
        );

        // ── Oylik KPI: shu oy uchun 1 rekord ──
        await this.monthlyRepo.upsert({
          seller_id: seller.id,
          year,
          month,
          conversion_completed: {},
          sale_target: targets.sale_sum_target,
          sale_sum: 0,
          sale_completed: false,
        });
      }),
    );

    this.logger.log(`[initMonthKpi] Yaratildi: ${sellers.length} sotuvchi uchun`);
  }

  // ═══════════════════════════════════════════════════════
  // 2.  KUN OXIRI — kunlik KPI ni to'ldirish
  //     Har kuni soat 23:00 da ishlaydi
  // ═══════════════════════════════════════════════════════
  @Cron('0 23 * * *', { timeZone: 'Asia/Tashkent' })
  async calculateDailyKpi() {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    this.logger.log(`[calculateDailyKpi] ${today.toISOString().slice(0, 10)} kunlik KPI hisoblanmoqda...`);

    const sellers = await this.dailyRepo.getSellers();

    await Promise.all(
      sellers.map(async (seller) => {
        const level = (seller.level ?? 'junior') as SellerLevel;
        const targets = LEVEL_TARGETS[level];

        // Statistikadan call va time ni olamiz
        const stats = await this.dailyRepo.getSellersCallsCount(seller.id, today);
        const calls_count = stats?.total_count ?? 0;
        const talk_time_seconds = stats?.time ?? 0;

        // Kelish vaqtini seller.today_work_start_time dan olamiz
        const workStart = seller.today_work_start_time;
        let started_time: string | undefined;
        let started_on_time = false;

        if (workStart) {
          const hh = workStart.getHours().toString().padStart(2, '0');
          const mm = workStart.getMinutes().toString().padStart(2, '0');
          started_time = `${hh}:${mm}`;
          started_on_time = this.isOnTime(started_time, '10:00');
        }

        await this.dailyRepo.upsert({
          seller_id: seller.id,
          date: today,
          started_time,
          started_on_time,
          calls_count,
          calls_target: targets.calls_per_day,
          calls_done: calls_count >= targets.calls_per_day,
          talk_time_seconds,
          talk_time_target: targets.talk_time_seconds,
          talk_time_done: talk_time_seconds >= targets.talk_time_seconds,
        });
      }),
    );

    // Kunlik yangilangandan keyin oylik summani ham yangilaymiz
    await this.updateMonthlySaleSum(year, month);

    this.logger.log(`[calculateDailyKpi] Tugatildi`);
  }

  // ═══════════════════════════════════════════════════════
  // 3.  OY YARMI — konversiya (1-15 kun)
  //     Har oyning 15-kuni soat 23:30 da ishlaydi
  // ═══════════════════════════════════════════════════════
  @Cron('30 23 15 * *', { timeZone: 'Asia/Tashkent' })
  async calculateMidMonthConversion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month - 1, 15, 23, 59, 59, 999);

    await this.updateConversion('mid', year, month, fromDate, toDate);
    this.logger.log(`[calculateMidMonthConversion] ${year}-${month} o'rta oy konversiya saqlandi`);
  }

  // ═══════════════════════════════════════════════════════
  // 4.  OY OXIRI — konversiya (1-oxir kun)
  //     Har oyning oxirgi kuni soat 23:30 da ishlaydi
  //     Buning uchun har kuni tekshiramiz: bugun oyning oxirgi kuni?
  // ═══════════════════════════════════════════════════════
  @Cron('30 23 * * *', { timeZone: 'Asia/Tashkent' })
  async calculateEndMonthConversion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const lastDay = new Date(year, month, 0).getDate();
    if (now.getDate() !== lastDay) return; // Faqat oxirgi kun

    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0, 23, 59, 59, 999);

    await this.updateConversion('end', year, month, fromDate, toDate);
    this.logger.log(`[calculateEndMonthConversion] ${year}-${month} oy oxiri konversiya saqlandi`);
  }

  // ═══════════════════════════════════════════════════════
  // YORDAMCHI: Konversiyani yangilash (mid yoki end)
  // ═══════════════════════════════════════════════════════
  private async updateConversion(period: 'mid' | 'end', year: number, month: number, fromDate: Date, toDate: Date) {
    const sellers = await this.dailyRepo.getSellers();

    await Promise.all(
      sellers.map(async (seller) => {
        const level = (seller.level ?? 'junior') as SellerLevel;
        const target = LEVEL_TARGETS[level].conversion_pct;

        const { leads_count, sales_count } = await this.monthlyRepo.getConversionData(seller.id, fromDate, toDate);

        const conversion_pct = leads_count > 0 ? parseFloat(((sales_count / leads_count) * 100).toFixed(2)) : 0;

        const existing = await this.monthlyRepo.findOne(seller.id, year, month);
        const prev_json = (existing?.conversion_completed ?? {}) as Record<string, any>;

        const updated_json = {
          ...prev_json,
          [period]: {
            leads_count,
            sales_count,
            conversion_pct,
            target_pct: target,
            completed: conversion_pct >= target,
            calculated_at: new Date().toISOString(),
          },
        };

        await this.monthlyRepo.upsert({
          seller_id: seller.id,
          year,
          month,
          conversion_completed: updated_json,
        });
      }),
    );
  }

  // ═══════════════════════════════════════════════════════
  // YORDAMCHI: Oylik sotuv summasini yangilash
  // ═══════════════════════════════════════════════════════
  private async updateMonthlySaleSum(year: number, month: number) {
    const sellers = await this.dailyRepo.getSellers();

    await Promise.all(
      sellers.map(async (seller) => {
        const level = (seller.level ?? 'junior') as SellerLevel;
        const target = LEVEL_TARGETS[level].sale_sum_target;

        const { total_sum, total_count } = await this.monthlyRepo.getSellerMonthlySale(seller.id, year, month);

        await this.monthlyRepo.upsert({
          seller_id: seller.id,
          year,
          month,
          sale_sum: total_sum,
          sale_target: target,
          sale_completed: total_sum >= target,
          sale_count: total_count,
        });
      }),
    );
  }

  // ═══════════════════════════════════════════════════════
  // 5.  UMUMIY KPI BALL HISOBLASH
  //     Istalgan kunda shu oy uchun hozirgi holat
  // ═══════════════════════════════════════════════════════
  async calculateSellerKpiScore(seller_id: string, year?: number, month?: number): Promise<KpiScoreResult> {
    const now = new Date();
    const _year = year ?? now.getFullYear();
    const _month = month ?? now.getMonth() + 1;

    // Oylik va kunlik ma'lumotlarni parallel olamiz
    const [monthlyKpi, dailyKpis] = await Promise.all([
      this.monthlyRepo.findOne(seller_id, _year, _month),
      this.dailyRepo.findMonthDays(seller_id, _year, _month),
    ]);

    // Faqat o'tgan (yoki bugungi) kunlarni hisoblaymiz
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const pastDays = dailyKpis.filter((d) => new Date(d.date) <= today);
    const working_days = pastDays.length;

    // ── Kunlik kategoriyalar (necha kuni bajarildi / jami o'tgan kunlar) ──
    const days_on_time = pastDays.filter((d) => d.started_on_time).length;
    const days_calls_done = pastDays.filter((d) => d.calls_done).length;
    const days_talk_done = pastDays.filter((d) => d.talk_time_done).length;
    const days_qa_passed = pastDays.filter((d) => d.qa_passed).length;

    // ── Ball hisoblash: nisbat (bajarilgan kunlar / o'tgan kunlar) × max ball ──
    const ratio = (done: number) => (dailyKpis.length > 0 ? done / dailyKpis.length : 0);

    const started_on_time_score = Math.round(ratio(days_on_time) * KPI_SCORES.STARTED_ON_TIME);
    const calls_score = Math.round(ratio(days_calls_done) * KPI_SCORES.CALLS);
    const talk_time_score = Math.round(ratio(days_talk_done) * KPI_SCORES.TALK_TIME);
    const qa_score = Math.round(ratio(days_qa_passed) * KPI_SCORES.QA);

    // ── Sotuv summasi bali ──
    const sale_sum = BigInt(monthlyKpi?.sale_sum ?? 0);
    const sale_target = BigInt(monthlyKpi?.sale_target ?? 0);
    const sale_completed = monthlyKpi?.sale_completed ?? false;
    const sale_sum_score = sale_completed ? KPI_SCORES.SALE_SUM : this.calcSaleScore(sale_sum, sale_target);

    // ── Konversiya bali ──
    const convJson = (monthlyKpi?.conversion_completed ?? {}) as Record<string, any>;
    const conversion_score = this.calcConversionScore(convJson);
    const conversion_mid_pct = convJson?.mid?.conversion_pct ?? null;
    const conversion_end_pct = convJson?.end?.conversion_pct ?? null;
    const conversion_target_pct = convJson?.mid?.target_pct ?? 0;

    // ── Jami ──
    const total_score =
      started_on_time_score + calls_score + talk_time_score + qa_score + sale_sum_score + conversion_score;

    return {
      seller_id,
      year: _year,
      month: _month,
      calculated_at: new Date(),

      started_on_time_score,
      calls_score,
      talk_time_score,
      conversion_score,
      sale_sum_score,
      qa_score,
      total_score,

      details: {
        days_on_time,
        days_calls_done,
        days_talk_done,
        days_qa_passed,
        working_days,

        sale_sum,
        sale_target,
        sale_completed,

        conversion_mid_pct,
        conversion_end_pct,
        conversion_target: conversion_target_pct,
      },
    };
  }

  // ═══════════════════════════════════════════════════════
  // Barcha sotuvchilarning KPI ballini bir yo'la olish
  // ═══════════════════════════════════════════════════════
  async calculateAllSellersKpiScore(year?: number, month?: number) {
    const sellers = await this.dailyRepo.getSellers();
    return Promise.all(sellers.map((s) => this.calculateSellerKpiScore(s.id, year, month)));
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════

  /** Sotuv summasi bali: targetga nisbat (progressiv) */
  private calcSaleScore(sale_sum: bigint, sale_target: bigint): number {
    if (sale_target <= 0n) return 0;
    const pct = Number((sale_sum * 100n) / sale_target); // integer %
    if (pct >= 100) return KPI_SCORES.SALE_SUM; // 25
    if (pct >= 75) return Math.round(KPI_SCORES.SALE_SUM * 0.75); // 18-19
    if (pct >= 50) return Math.round(KPI_SCORES.SALE_SUM * 0.5); // 12-13
    if (pct >= 25) return Math.round(KPI_SCORES.SALE_SUM * 0.25); // 6
    return 0;
  }

  /**
   * Konversiya bali:
   *  - Faqat mid mavjud bo'lsa → 10 ball (yarim oy)
   *  - Ikkalasi ham mavjud    → 20 ball
   *  - Har biri uchun: completed ? to'liq yarmi : 0
   */
  private calcConversionScore(convJson: Record<string, any>): number {
    const midCompleted = convJson?.mid?.completed ?? false;
    const endCompleted = convJson?.end?.completed ?? false;

    const hasMid = !!convJson?.mid;
    const hasEnd = !!convJson?.end;

    let score = 0;
    if (hasMid) score += midCompleted ? 10 : 0;
    if (hasEnd) score += endCompleted ? 10 : 0;

    // Agar hali oy yarmi o'tmagan bo'lsa — mid yo'q → 0
    return Math.min(score, KPI_SCORES.CONVERSION); // max 20
  }

  /** "HH:MM" formatida vaqt solishtirish */
  private isOnTime(actual: string, target: string): boolean {
    const [ah, am] = actual.split(':').map(Number);
    const [th, tm] = target.split(':').map(Number);
    return ah * 60 + am <= th * 60 + tm;
  }
}
