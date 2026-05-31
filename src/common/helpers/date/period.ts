// utils/period.util.ts

export type PeriodType = 'full' | 'h1' | 'h2';

export interface PeriodRange {
  start: Date;
  end: Date;
}

export interface MonthPeriodStatus {
  year: number;
  month: number;
  // To'liq oy tugaganmi
  full_completed: boolean;
  // h1 (1-15) tugaganmi
  h1_completed: boolean;
  // h2 (16-oxir) tugaganmi
  h2_completed: boolean;
}

export function getPeriodRange(year: number, month: number, period: PeriodType): PeriodRange {
  switch (period) {
    case 'h1':
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month - 1, 16), // 16-sana boshi = 15-sana oxiri
      };
    case 'h2':
      return {
        start: new Date(year, month - 1, 16),
        end: new Date(year, month, 1), // Keyingi oy boshi = oy oxiri
      };
    case 'full':
    default:
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 1),
      };
  }
}

// Berilgan period tugaganmi yoki hali davom etyaptimi
export function isPeriodCompleted(year: number, month: number, period: PeriodType, now: Date = new Date()): boolean {
  const { end } = getPeriodRange(year, month, period);
  return now >= end;
}

// Oy uchun barcha period statuslarini qaytaradi
export function getMonthPeriodStatus(year: number, month: number, now: Date = new Date()): MonthPeriodStatus {
  return {
    year,
    month,
    full_completed: isPeriodCompleted(year, month, 'full', now),
    h1_completed: isPeriodCompleted(year, month, 'h1', now),
    h2_completed: isPeriodCompleted(year, month, 'h2', now),
  };
}

// start_date va end_date oralig'idagi barcha yil/oy kombinatsiyalarini qaytaradi
export function getMonthsInRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = [];

  let y = startYear;
  let m = startMonth;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return months;
}
