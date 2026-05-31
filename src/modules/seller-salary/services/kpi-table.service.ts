// kpi-table.service.ts
import { Injectable } from '@nestjs/common';
import { KpiTableRepository } from '../repositories/kpi-table.repository';
import { SellerKpiService } from './seller-kpi.service';
import { DayKpiCell, KPI_SCORES, KpiTableResponse, LEVEL_TARGETS, SellerKpiTableRow, WeekGroup } from './kpi.constanta';

// O'zbekcha hafta kunlari qisqartmasi (0=Yakshanba)
const WEEKDAY_LABELS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

@Injectable()
export class KpiTableService {
  constructor(
    private readonly tableRepo: KpiTableRepository,
    private readonly kpiService: SellerKpiService,
  ) {}

  // ─── Asosiy metod: butun jadval ─────────────────────────────
  async getKpiTable(year: number, month: number): Promise<KpiTableResponse> {
    const sellers = await this.tableRepo.getSellers();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sellerRows = await Promise.all(sellers.map((seller) => this.buildSellerRow(seller, year, month, today)));

    return { year, month, sellers: sellerRows };
  }

  // ─── Bitta sotuvchi uchun qator ─────────────────────────────
  async getSellerKpiTable(seller_id: string, year: number, month: number): Promise<SellerKpiTableRow> {
    const sellers = await this.tableRepo.getSellers();
    const seller = sellers.find((s) => s.id === seller_id);
    if (!seller) throw new Error(`Seller ${seller_id} topilmadi`);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return this.buildSellerRow(seller, year, month, today);
  }

  // ────────────────────────────────────────────────────────────
  private async buildSellerRow(seller: any, year: number, month: number, today: Date): Promise<SellerKpiTableRow> {
    const level = seller.level ?? 'junior';
    const targets: any = LEVEL_TARGETS[level as keyof typeof LEVEL_TARGETS];

    // Parallel fetch
    const [dailyKpis, dailySales, dailyLeads, monthlyKpi] = await Promise.all([
      this.tableRepo.getSellerDailyKpis(seller.id, year, month),
      this.tableRepo.getSellerDailySales(seller.id, year, month),
      this.tableRepo.getSellerDailyLeads(seller.id, year, month),
      this.tableRepo.getMonthlyKpi(seller.id, year, month),
    ]);

    // daily_kpi ni map'ga o'tkazamiz  { "2025-02-01": record }
    const kpiMap: Record<string, (typeof dailyKpis)[0]> = {};
    for (const row of dailyKpis) {
      kpiMap[new Date(row.date).toISOString().slice(0, 10)] = row;
    }

    // Oyning barcha kunlarini yasaymiz
    // JavaScript Date: month 0-indexed (0=yanvar, 1=fevral, ...)
    // Bizning month parametr: 1-indexed (1=yanvar, 2=fevral, ...)
    //
    // Loop'da: new Date(year, month - 1, d) ishlatamiz
    // Demak daysInMonth uchun ham month-1+1 = month ishlatamiz:
    const daysInMonth = new Date(year, month, 0).getDate(); // month=2 → 2026-02 oxiri
    const cells: DayKpiCell[] = [];

    // DEBUG LOG
    console.log(`[KPI Table] Building cells for ${year}-${month.toString().padStart(2, '0')}`);
    console.log(`[KPI Table] daysInMonth: ${daysInMonth}`);
    console.log(`[KPI Table] dailyKpis count: ${dailyKpis.length}`);
    if (dailyKpis.length > 0) {
      console.log(`[KPI Table] First KPI date:`, new Date(dailyKpis[0].date).toISOString().slice(0, 10));
      console.log(
        `[KPI Table] Last KPI date:`,
        new Date(dailyKpis[dailyKpis.length - 1].date).toISOString().slice(0, 10),
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dateKey = date.toISOString().slice(0, 10);
      const kpi = kpiMap[dateKey];
      const isFuture = date > today;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Sotuv va leads
      const saleSumToday = dailySales[dateKey]?.sum ?? null;
      const salesCount = dailySales[dateKey]?.count ?? 0;
      const leadsCount = dailyLeads[dateKey] ?? 0;

      // Konversiya: shu kun uchun leads va sotuvdan %
      const conversion_pct =
        leadsCount > 0 && !isFuture ? parseFloat(((salesCount / leadsCount) * 100).toFixed(1)) : null;

      // Kunlik KPI ball hisoblash (0–100%)
      const daily_kpi_pct = isFuture || !kpi ? null : this.calcDailyKpiPct(kpi, conversion_pct, saleSumToday, targets);

      // Plan vs Fakt: targetga nisbatan qancha bajarildi (calls % × 0.4 + talk % × 0.6)
      const plan_vs_fact_pct = isFuture || !kpi ? null : this.calcPlanVsFact(kpi, saleSumToday, targets);

      cells.push({
        date: dateKey,
        day_number: d,
        weekday: WEEKDAY_LABELS[date.getDay()],
        is_weekend: isWeekend,
        is_future: isFuture,

        qa_passed: isFuture ? null : (kpi?.qa_passed ?? null),
        started_time: isFuture ? null : (kpi?.started_time ?? null),
        started_on_time: isFuture ? null : (kpi?.started_on_time ?? null),

        calls_count: isFuture ? null : (kpi?.calls_count ?? null),
        calls_target: kpi?.calls_target ?? targets.calls_per_day,
        calls_done: isFuture ? null : (kpi?.calls_done ?? null),

        talk_time_seconds: isFuture ? null : (kpi?.talk_time_seconds ?? null),
        talk_time_display:
          isFuture || kpi?.talk_time_seconds == null ? null : this.formatSeconds(kpi.talk_time_seconds),
        talk_time_target: kpi?.talk_time_target ?? targets.talk_time_seconds,
        talk_time_done: isFuture ? null : (kpi?.talk_time_done ?? null),

        conversion_pct,
        sale_sum: isFuture ? null : saleSumToday,
        sale_sum_display: isFuture || saleSumToday == null ? null : this.formatSum(saleSumToday),

        daily_kpi_pct,
        plan_vs_fact_pct,
      });
    }

    // Haftalar bo'yicha guruhlash
    const weeks = this.groupByWeek(cells);

    // Summary
    const pastCells = cells.filter((c) => !c.is_future && !c.is_weekend);
    const working_days = pastCells.length;
    const total_calls = pastCells.reduce((s, c) => s + (c.calls_count ?? 0), 0);
    const total_talk_sec = pastCells.reduce((s, c) => s + (c.talk_time_seconds ?? 0), 0);
    const total_sale_sum = pastCells.reduce((s, c) => s + (c.sale_sum ?? 0), 0);
    const days_on_time = pastCells.filter((c) => c.started_on_time).length;
    const days_qa_passed = pastCells.filter((c) => c.qa_passed).length;
    const kpi_values = pastCells.map((c) => c.daily_kpi_pct ?? 0);
    const avg_kpi = kpi_values.length ? Math.round(kpi_values.reduce((a, b) => a + b, 0) / kpi_values.length) : 0;

    // Oylik KPI % — kpiService dan
    const monthScore = await this.kpiService.calculateSellerKpiScore(seller.id, year, month);
    const monthly_pct = Math.round((monthScore.total_score / KPI_SCORES.TOTAL) * 100);

    return {
      seller_id: seller.id,
      seller_name: `${seller.user?.first_name ?? 'Unknown'} ${seller.user?.last_name}`,
      level: this.capitalize(level),
      monthly_kpi_pct: monthly_pct,
      weeks,
      summary: {
        total_calls,
        total_talk_seconds: total_talk_sec,
        total_sale_sum,
        avg_daily_kpi_pct: avg_kpi,
        days_on_time,
        days_qa_passed,
        working_days_passed: working_days,
      },
    };
  }

  // ─── Kunlik KPI % (0–100) ────────────────────────────────────
  /**
   * Bitta kun uchun KPI % ni hisoblaydi.
   * Bu "shu kun bajarildi yoki yo'q" logikasi,
   * oylik balldan farqli — kunlik snapshot.
   *
   * Ballar:
   *  Ishga kelish   10
   *  Calllar        20
   *  Talk time      15
   *  QA             10
   *  Konversiya     20  (oylik mid/end emas, kunlik leads/sale)
   *  Sotuv summasi  25
   *  JAMI          100
   */
  private calcDailyKpiPct(
    kpi: any,
    conversion_pct: number | null,
    sale_sum: number | null,
    targets: (typeof LEVEL_TARGETS)['junior'],
  ): number {
    let score = 0;

    // Ishga kelish (10 ball)
    if (kpi.started_on_time) score += KPI_SCORES.STARTED_ON_TIME;

    // Calllar (20 ball) — qisman ham beriladi
    if (kpi.calls_done) score += KPI_SCORES.CALLS;

    // Talk time (15 ball) — qisman
    if (kpi.talk_time_done) score += KPI_SCORES.TALK_TIME;

    // QA (10 ball)
    if (kpi.qa_passed) score += KPI_SCORES.QA;

    // Konversiya (20 ball) — targetga yetdimi
    if (conversion_pct != null) {
      const ratio = Math.min(conversion_pct / targets.conversion_pct, 1);
      score += Math.round(ratio * KPI_SCORES.CONVERSION);
    }

    // Sotuv summasi (25 ball) — qisman (kunlik targetdan ulush)
    if (sale_sum != null) {
      // Kunlik sotuv target = oylik target / ish kunlari (taxminan 22)
      const daily_target = Number(targets.sale_sum_target) / 22;
      const ratio = Math.min(sale_sum / daily_target, 1);
      score += Math.round(ratio * KPI_SCORES.SALE_SUM);
    }

    return Math.min(score, 100);
  }

  // ─── Plan vs Fakt % ─────────────────────────────────────────
  private calcPlanVsFact(kpi: any, sale_sum: number | null, targets: (typeof LEVEL_TARGETS)['junior']): number {
    const callRatio = kpi.calls_target > 0 ? Math.min((kpi.calls_count ?? 0) / kpi.calls_target, 1) : 0;
    const talkRatio = kpi.talk_time_target > 0 ? Math.min((kpi.talk_time_seconds ?? 0) / kpi.talk_time_target, 1) : 0;

    const daily_sale_target = Number(targets.sale_sum_target) / 22;
    const saleRatio = daily_sale_target > 0 ? Math.min((sale_sum ?? 0) / daily_sale_target, 1) : 0;

    // Og'irlik: calls 30%, talk_time 30%, sotuv 40%
    return Math.round((callRatio * 0.3 + talkRatio * 0.3 + saleRatio * 0.4) * 100);
  }

  // ─── Haftalar bo'yicha guruhlash ────────────────────────────
  /**
   * O'zbek kalendar tizimida hafta:
   *  - Dushanba (1) dan boshlanadi
   *  - Yakshanba (0) da tugaydi
   *
   * Agar oyning birinchi kuni dushanba bo'lmasa (masalan, juma),
   * u kunlar alohida "to'liq bo'lmagan hafta" sifatida 1-haftaga kiradi.
   */
  private groupByWeek(cells: DayKpiCell[]): WeekGroup[] {
    if (cells.length === 0) return [];

    const weeks: WeekGroup[] = [];
    let week_number = 1;
    let weekCells: DayKpiCell[] = [];

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const date = new Date(cell.date);
      const dayOfWeek = date.getDay(); // 0=Ya, 1=Du, 2=Se, ..., 6=Sh

      weekCells.push(cell);

      // Hafta yopilish shartlari:
      // 1. Yakshanba (0) yetdi
      // 2. Oyning oxirgi kuni
      const isLastCell = i === cells.length - 1;
      const isSunday = dayOfWeek === 0;

      if (isSunday || isLastCell) {
        weeks.push({
          week_number,
          label: `${week_number}-HAFTA`,
          days: weekCells,
        });
        week_number++;
        weekCells = [];
      }
    }

    return weeks;
  }

  // ─── Format helpers ──────────────────────────────────────────

  /** 9015 → "2s 30m" */
  private formatSeconds(sec: number): string {
    if (sec <= 0) return '0m';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0 && m > 0) return `${h}s ${m}m`;
    if (h > 0) return `${h}s`;
    return `${m}m`;
  }

  /** 42000000 → "42M" */
  private formatSum(sum: number): string {
    if (sum >= 1_000_000_000) return `${(sum / 1_000_000_000).toFixed(1)}B`;
    if (sum >= 1_000_000) return `${Math.round(sum / 1_000_000)}M`;
    if (sum >= 1_000) return `${Math.round(sum / 1_000)}K`;
    return `${sum}`;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
