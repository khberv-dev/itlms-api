import { Injectable, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GroupSnapshotRepository } from './group_monthly_snapshot.repository';
import {
  SnapshotRangeQueryDto,
  GroupSnapshotQueryDto,
  MentorSnapshotQueryDto,
} from './dto/group_montly_snapshot.dto';
import {
  PeriodType,
  getPeriodRange,
  getMonthPeriodStatus,
  getMonthsInRange,
  isPeriodCompleted,
} from '../../common/helpers/date/period'
import { GroupSnapshotStatsQueryDto } from './dto/get-stats.dto';

export interface PeriodStats {
  active_count_start: number;
  active_count_end: number;
  joined_count: number;
  churned_count: number;
  transferred_out_count: number;
  transferred_in_count: number;
  company_churned_count: number;
  mentor_churned_count: number;
  retention_rate: number;
  churn_rate: number;
  company_churn_rate: number;
  mentor_churn_rate: number;
  ltv: number;
  expired_count: number;
  is_realtime: boolean;
}

export interface MonthSnapshot {
  year: number;
  month: number;
  mentor_id: string | null;
  assistant_id: string | null;
  full: PeriodStats | null;
  h1: PeriodStats | null;
  h2: PeriodStats | null;
}

@Injectable()
export class GroupSnapshotService {
  constructor(private readonly snapshotRepo: GroupSnapshotRepository) { }

  // =============================================
  // CRON JOBS
  // =============================================

  @Cron('0 2 16 * *')
  async calculateFirstHalf() {
    const now = new Date();
    await this.calculateAndSaveMonthSnapshot(
      now.getFullYear(),
      now.getMonth() + 1,
      'h1',
    );
  }

  @Cron('0 2 1 * *')
  async calculateFullAndSecondHalf() {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    await this.calculateAndSaveMonthSnapshot(prevYear, prevMonth, 'h2');
    await this.calculateAndSaveMonthSnapshot(prevYear, prevMonth, 'full');
  }

  async triggerCalculation(
    year: number,
    month: number,
    period: PeriodType = 'full',
  ) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month 1-12 orasida bo\'lishi kerak');
    }
    return this.calculateAndSaveMonthSnapshot(year, month, period);
  }

  // =============================================
  // HISOBLASH VA SAQLASH
  // Muhim: mentor_id ni o'SHA OY boshidagi holatdan olish
  // =============================================

  private async calculateAndSaveMonthSnapshot(
    year: number,
    month: number,
    period: PeriodType,
  ) {
    const { start, end } = getPeriodRange(year, month, period);
    const groups = await this.snapshotRepo.getAllActiveGroups();

    const results = await Promise.allSettled(
      groups.map(async (group) => {
        const stats = await this.computeGroupStats(group.id, start, end);

        return this.snapshotRepo.upsertSnapshotPeriod({
          group_id: group.id,
          mentor_id: group.mentor_id,       // tarixiy to'g'ri
          assistant_id: group.assistant_id,
          year,
          month,
          period,
          ...stats,
        });
      }),
    );

    return {
      year,
      month,
      period,
      total_groups: groups.length,
      succeeded: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  // =============================================
  // RAW STATS HISOBLASH
  // =============================================

  private async computeGroupStats(
    group_id: string,
    start: Date,
    end: Date,
  ): Promise<Omit<PeriodStats, 'is_realtime'>> {
    const [
      active_count_start,
      active_count_end,
      joined_count,
      dropped_count,
      churn_frozen_count,
      { transferred_out_count, transferred_by_mentor_issue },
      transferred_in_count,
      ltv,
      expired_count,
    ] = await Promise.all([
      this.snapshotRepo.getActiveCountt(group_id, start),
      this.snapshotRepo.getActiveCountt(group_id, end),
      this.snapshotRepo.getJoinedCount(group_id, start, end),
      this.snapshotRepo.getDroppedCount(group_id, start, end),
      this.snapshotRepo.getChurnFrozenCount(group_id, start, end),
      this.snapshotRepo.getTransferredOutCount(group_id, start, end),
      this.snapshotRepo.getTransferredInCount(group_id, start, end),
      this.snapshotRepo.getLtv(group_id, start, end),
      this.snapshotRepo.getExpiredCount(group_id, start, end), // Qo'shimcha churn tipi
    ]);

    const churned_count =
      dropped_count + churn_frozen_count + transferred_out_count + expired_count;
    const company_churned_count = dropped_count + churn_frozen_count + expired_count;
    const mentor_churned_count = dropped_count + churn_frozen_count + transferred_by_mentor_issue;

    const rate = (val: number, base: number) =>
      base > 0 ? Math.round((val / base) * 10000) / 100 : 0;

    return {
      active_count_start,
      active_count_end,
      joined_count,
      churned_count,
      transferred_out_count,
      transferred_in_count,
      company_churned_count,
      mentor_churned_count,
      retention_rate: rate(active_count_start - churned_count, active_count_start),
      churn_rate: rate(churned_count, active_count_start),
      company_churn_rate: rate(company_churned_count, active_count_start),
      mentor_churn_rate: rate(mentor_churned_count, active_count_start),
      ltv: this.calculateLtv(ltv).ltv,
      expired_count
    };
  }


  private async computeMulti(
    group_ids: string[],
    year: number,
    month: number,
    type: 'mentor' | 'company',
  ) {
    const { start } = getPeriodRange(year, month, 'full');
    const now = new Date();

    const stats = await Promise.all(
      group_ids.map((id) => this.computeGroupStats(id, start, now)),
    );

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    const churn =
      type === 'mentor'
        ? avg(stats.map((s) => s.mentor_churn_rate))
        : avg(stats.map((s) => s.company_churn_rate));

    return this.format(churn, avg(stats.map((s) => s.ltv)), true);
  }


  async getStats(query: GroupSnapshotStatsQueryDto) {
    const { startYear, startMonth, endYear, endMonth } =
      this.parseDateRange(query.start_date, query.end_date);

    const months = getMonthsInRange(startYear, startMonth, endYear, endMonth);

    const results = await Promise.all(
      months.map((m) => this.resolveMonth(m.year, m.month, query)),
    );

    return this.buildResponse(results.filter(Boolean) as any[], query);
  }

  private async resolveMonth(year: number, month: number, query: GroupSnapshotStatsQueryDto) {
    const now = new Date();
    const isCompleted = isPeriodCompleted(year, month, 'full', now);

    if (query.group_id) {
      return isCompleted
        ? this.getGroupSnapshot(query.group_id, year, month)
        : this.getGroupRealtime(query.group_id, year, month);
    }

    if (query.mentor_id) {
      return isCompleted
        ? this.getMentorSnapshot(query.mentor_id, year, month)
        : this.getMentorRealtime(query.mentor_id, year, month);
    }

    return isCompleted
      ? this.getCompanySnapshot(year, month)
      : this.getCompanyRealtime(year, month);
  }


  private async getGroupSnapshot(group_id: string, year: number, month: number) {
    const snaps = await this.snapshotRepo.getSnapshotsForGroup(group_id, [{ year, month }]);

    if (!snaps.length) return null;

    return this.avgFormat(
      snaps.map((s) => s.churn_rate ?? 0),
      snaps.map((s) => Number(s.ltv ?? 0)),
      false,
    );
  }

  private async getMentorSnapshot(mentor_id: string, year: number, month: number) {
    const snaps = await this.snapshotRepo.getSnapshotsByMentor(mentor_id, [{ year, month }]);
    if (!snaps.length) return null;

    return this.avgFormat(
      snaps.map((s) => s.mentor_churn_rate ?? 0),
      snaps.map((s) => Number(s.ltv ?? 0)),
      false,
    );
  }

  private async getCompanySnapshot(year: number, month: number) {
    const snaps = await this.snapshotRepo.getSnapshotsForCompany([{ year, month }]);
    if (!snaps.length) return null;

    return this.avgFormat(
      snaps.map((s) => s.company_churn_rate ?? 0),
      snaps.map((s) => Number(s.ltv ?? 0)),
      false,
    );
  }

  private async getGroupRealtime(group_id: string, year: number, month: number) {
    const { start } = getPeriodRange(year, month, 'full');
    const stats = await this.computeGroupStats(group_id, start, new Date());

    return this.format(stats.churn_rate, stats.ltv, true);
  }

  private async getMentorRealtime(mentor_id: string, year: number, month: number) {
    const group_ids = await this.snapshotRepo.getGroupIds({ mentor_id });
    return await this.computeMulti(group_ids, year, month, 'mentor');
  }

  private async getCompanyRealtime(year: number, month: number) {
    const group_ids = await this.snapshotRepo.getGroupIds({});
    return await this.computeMulti(group_ids, year, month, 'company');
  }

  async getCompanyTrend(query: { start_date: string; end_date: string }) {
    const { startYear, startMonth, endYear, endMonth } =
      this.parseDateRange(query.start_date, query.end_date);

    const months = getMonthsInRange(startYear, startMonth, endYear, endMonth);
    const now = new Date();

    const result = await Promise.all(
      months.map(async ({ year, month }) => {
        const isCompleted = isPeriodCompleted(year, month, 'full', now);

        if (isCompleted) {
          return { ...(await this.getCompanyMonthFromSnapshot(year, month)), month, year };
        } else {
          return { ...(await this.getCompanyRealtime(year, month)), month, year };
        }
      }),
    );

    return {
      months: result.filter(Boolean),
    };
  }

  private async getCompanyMonthFromSnapshot(year: number, month: number) {
    const snaps = await this.snapshotRepo.getSnapshotsForCompany([{ year, month }]);

    if (!snaps.length) return null;

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    const churn = avg(snaps.map((s) => s.company_churn_rate ?? 0));

    return {
      month,
      retention: this.round(100 - churn),
      churn: this.round(churn),
      is_realtime: false,
    };
  }

  async getMentorsStats(query: {
    start_date: string;
    end_date: string;
  }) {
    const mentors = await this.snapshotRepo.getAllMentors();

    const results = await Promise.all(
      mentors.map(async (mentor) => {
        const stats = await this.getStats({
          start_date: query.start_date,
          end_date: query.end_date,
          mentor_id: mentor.id,
        });

        return {
          mentor_id: mentor.id,
          name: `${mentor.user.first_name} ${mentor.user.last_name}`,
          retention_rate: stats.retention_rate,
          churn_rate: stats.churn_rate,
          ltv: stats.ltv,
          has_realtime: stats.has_realtime,
          student_count:0
        };
      }),
    );

    return {
      mentors: results,
    };
  }

  private calculateLtv(sales: { student_id: string; month: number; sum: any }[]) {
    if (!sales.length) {
      return {
        avg_month: 0,
        avg_monthly_revenue: 0,
        ltv: 0,
      };
    }

    // ------------------------
    // UNIQUE STUDENTS
    // ------------------------
    const uniqueStudents = new Set(sales.map((s) => s.student_id));
    const studentCount = uniqueStudents.size;

    // ------------------------
    // TOTALS
    // ------------------------
    let totalMonths = 0;
    let totalSum = 0;

    for (const s of sales) {
      totalMonths += s.month || 0;
      totalSum += Number(s.sum || 0);
    }

    if (totalMonths === 0 || studentCount === 0) {
      return {
        avg_month: 0,
        avg_monthly_revenue: 0,
        ltv: 0,
      };
    }

    // ------------------------
    // CALCULATIONS
    // ------------------------
    const avgMonth = totalMonths / studentCount;

    const avgMonthlyRevenue = totalSum / totalMonths;

    const ltv = avgMonth * avgMonthlyRevenue;

    return {
      avg_month: this.round(avgMonth),
      avg_monthly_revenue: this.round(avgMonthlyRevenue),
      ltv: this.round(ltv),
    };
  }

  private format(churn: number, ltv: number, is_realtime: boolean) {
    return {
      churn_rate: this.round(churn),
      retention_rate: this.round(100 - churn),
      ltv: this.round(ltv),
      is_realtime,
    };
  }

  private avgFormat(churns: number[], ltvs: number[], is_realtime: boolean) {
    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    return this.format(avg(churns), avg(ltvs), is_realtime);
  }

  private round(n: number) {
    return Math.round(n * 100) / 100;
  }

  private buildResponse(months: any[], query: GroupSnapshotStatsQueryDto) {
    if (!months.length) {
      return {
        churn_rate: 0,
        retention_rate: 0,
        ltv: 0,
        has_realtime: false,
      };
    }

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      churn_rate: this.round(avg(months.map((m) => m.churn_rate))),
      retention_rate: this.round(avg(months.map((m) => m.retention_rate))),
      ltv: this.round(avg(months.map((m) => m.ltv))),
      has_realtime: months.some((m) => m.is_realtime),
      period: { start: query.start_date, end: query.end_date },
    };
  }

  private parseDateRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);

    return {
      startYear: s.getFullYear(),
      startMonth: s.getMonth() + 1,
      endYear: e.getFullYear(),
      endMonth: e.getMonth() + 1,
    };
  }
}