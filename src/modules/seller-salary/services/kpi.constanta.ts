// kpi.constants.ts
// ============================================================
// KPI BALL TIZIMI
// ============================================================
//
//  Ishga kelish vaqti     10 ball
//  Calllar soni           20 ball
//  Gaplashilgan vaqt      15 ball
//  Konversiya             20 ball
//  Sotuv summasi          25 ball
//  Gaplashish sifati      10 ball
//  JAMI                  100 ball
//
// ============================================================

export const KPI_SCORES = {
  STARTED_ON_TIME: 10,
  CALLS: 20,
  TALK_TIME: 15,
  CONVERSION: 20,
  SALE_SUM: 25,
  QA: 10,
  TOTAL: 100,
} as const;

// Level bo'yicha kunlik targets
export const LEVEL_TARGETS = {
  junior: {
    calls_per_day: 60,
    talk_time_seconds: 10800, // 3 soat
    conversion_pct: 8, // %
    sale_sum_target: 35000000,
    kpi_sum: 2200000, // 2.2 million
  },
  middle: {
    calls_per_day: 50,
    talk_time_seconds: 9000, // 2.5 soat
    conversion_pct: 10,
    sale_sum_target: 70000000,
    kpi_sum: 3500000, // 3.5 million
  },
  senior: {
    calls_per_day: 40,
    talk_time_seconds: 7200, // 2 soat
    conversion_pct: 12,
    sale_sum_target: 70000000, // senior uchun minimum — yuqorisi cheksiz
    kpi_sum: 4500000, // 4.5 million
  },
} as const;

export type SellerLevel = keyof typeof LEVEL_TARGETS;

//-------------------------------------------------------------

// ============================================================
// kpi-table.types.ts  —  response tiplari
// ============================================================

/** Bitta kunning to'liq ma'lumoti (jadval katakchasi) */
export interface DayKpiCell {
  date: string; // "2025-02-01"
  day_number: number; // 1
  weekday: string; // "Ya" | "Du" | "Se" | "Ch" | "Pa" | "Ju" | "Sh"
  is_weekend: boolean;
  is_future: boolean;

  // Kunlik ko'rsatkichlar (expand bo'lganda ko'rinadi)
  qa_passed: boolean | null; // Gaplashish sifati
  started_time: string | null; // "08:30"
  started_on_time: boolean | null;

  calls_count: number | null; // 29
  calls_target: number; // 40
  calls_done: boolean | null;

  talk_time_display: string | null; // "4s 15m"  (soat/minut)
  talk_time_seconds: number | null;
  talk_time_target: number;
  talk_time_done: boolean | null;

  conversion_pct: number | null; // 15.8  (shu kun uchun)
  sale_sum: number | null; // 42000000
  sale_sum_display: string | null; // "42M"

  // Ball
  daily_kpi_pct: number | null; // 65  (%)
  plan_vs_fact_pct: number | null; // 44  (%)
}

/** Bir hafta */
export interface WeekGroup {
  week_number: number; // 1
  label: string; // "1-HAFTA"
  days: DayKpiCell[];
}

/** Sotuvchining oy davomidagi to'liq KPI jadvali */
export interface SellerKpiTableRow {
  seller_id: string;
  seller_name: string;
  level: string; // "Senior" | "Middle" | "Junior"
  monthly_kpi_pct: number; // 24  (oylik umumiy %)

  weeks: WeekGroup[];

  // Oy summari (jadval pastida yoki tooltip uchun)
  summary: {
    total_calls: number;
    total_talk_seconds: number;
    total_sale_sum: number;
    avg_daily_kpi_pct: number;
    days_on_time: number;
    days_qa_passed: number;
    working_days_passed: number;
  };
}

/** Butun jadvalning javobi */
export interface KpiTableResponse {
  year: number;
  month: number;
  sellers: SellerKpiTableRow[];
}
