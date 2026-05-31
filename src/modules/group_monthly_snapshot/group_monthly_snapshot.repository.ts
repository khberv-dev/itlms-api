import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { PeriodType } from '../../common/helpers/date/period';
interface UpsertPeriodParams {
    group_id: string;
    mentor_id?: string | null;
    assistant_id?: string | null;
    year: number;
    month: number;
    period: PeriodType;
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
}

@Injectable()
export class GroupSnapshotRepository {
    constructor(private readonly prisma: PrismaService) { }

    // =============================================
    // RAW DATA QUERIES
    // =============================================

    async getActiveCountt(group_id: string, date: Date): Promise<number> {
        return this.prisma.group_student.count({
            where: {
                group_id,
                joined_at: { lt: date },
                student: { status: 'active' },
                OR: [{ left_at: null }, { left_at: { gt: date } }],
            },
        });
    }

    async getJoinedCount(group_id: string, start: Date, end: Date): Promise<number> {
        return this.prisma.group_student.count({
            where: {
                group_id,
                joined_at: { gte: start, lt: end },
                transfer_reason: null,
            },
        });
    }

    async getDroppedCount(group_id: string, start: Date, end: Date): Promise<number> {
        return this.prisma.student_dropped.count({
            where: {
                group_id,
                dropped_at: { gte: start, lt: end },
            },
        });
    }

    async getChurnFrozenCount(group_id: string, start: Date, end: Date): Promise<number> {
        return this.prisma.student_frozen.count({
            where: {
                group_id,
                affects_retention: true,
                start_date: { gte: start, lt: end },
            },
        });
    }

    async getTransferredOutCount(
        group_id: string,
        start: Date,
        end: Date,
    ): Promise<{
        transferred_out_count: number;
        transferred_by_mentor_issue: number;
    }> {
        const [transferred_out_count, mentor_issue] = await Promise.all([
            this.prisma.group_student.count({
                where: {
                    group_id,
                    left_at: { gte: start, lt: end },
                    transfer_reason: { not: null },
                },
            }),
            this.prisma.group_student.count({
                where: {
                    group_id,
                    left_at: { gte: start, lt: end },
                    transfer_reason: 'mentor_issue',
                },
            }),
        ]);

        return {
            transferred_out_count,
            transferred_by_mentor_issue: mentor_issue,
        };
    }

    async getTransferredInCount(group_id: string, start: Date, end: Date): Promise<number> {
        return this.prisma.group_student.count({
            where: {
                group_id,
                joined_at: { lt: start },
                student: {
                    access_expires_at: { lt: end },
                }
            },
        });
    }

    async getExpiredCount(group_id: string, start: Date, end: Date): Promise<number> {
        return this.prisma.group_student.count({
            where: {
                group_id,
                joined_at: { gte: start, lt: end },
                transfer_reason: { not: null },
            },
        });
    }

    async getLtv(group_id: string, start: Date, end: Date) {
        const sales = await this.prisma.sale.findMany({
            where: {
                date: { gte: start, lt: end },
                student: {
                    group: {
                        id: group_id,
                    },
                },
            },
            select: {
                student_id: true,
                month: true,
                sum: true,
            },
        });

        return sales;
    }

    async getAllActiveGroups() {
        return this.prisma.group.findMany({
            where: { status: { in: ['active', 'paused'] } },
            select: { id: true, name: true, mentor_id: true, assistant_id: true },
        });
    }

    async getSnapshotsByMentor(
        mentor_id: string,
        years_months: Array<{ year: number; month: number }>,
    ) {
        return this.prisma.group_monthly_snapshot.findMany({
            where: {
                OR: [{ mentor_id }, { assistant_id: mentor_id }],
                AND: years_months.map(({ year, month }) => ({ year, month })).length > 0
                    ? [{ OR: years_months.map(({ year, month }) => ({ year, month })) }]
                    : [],
            },
        });
    }

    // Kompaniya — barcha guruhlarning snapshotlari
    async getSnapshotsForCompany(
        years_months: Array<{ year: number; month: number }>,
    ) {
        if (years_months.length === 0) return [];
        return this.prisma.group_monthly_snapshot.findMany({
            where: {
                OR: years_months.map(({ year, month }) => ({ year, month })),
            },
        });
    }

    // Guruh — bitta guruhning snapshotlari
    async getSnapshotsForGroup(
        group_id: string,
        years_months: Array<{ year: number; month: number }>,
    ) {
        if (years_months.length === 0) return [];
        return this.prisma.group_monthly_snapshot.findMany({
            where: {
                group_id,
                OR: years_months.map(({ year, month }) => ({ year, month })),
            },
        });
    }

    async getGroupIds(filter: { group_id?: string; mentor_id?: string }): Promise<string[]> {
        if (filter.group_id) return [filter.group_id];

        if (filter.mentor_id) {
            const groups = await this.prisma.group.findMany({
                where: { OR: [{ mentor_id: filter.mentor_id }, { assistant_id: filter.mentor_id }] },
                select: { id: true },
            });
            return groups.map((g) => g.id);
        }

        const groups = await this.prisma.group.findMany({ select: { id: true } });
        return groups.map((g) => g.id);
    }

    emptyStats() {
        return {
            active_count_start: 0, churned_count: 0,
            churn_rate: 0, company_churn_rate: 0, mentor_churn_rate: 0,
            retention_rate: 0, ltv: 0, is_realtime: false,
        };
    }

    async getAllMentors() {
        return this.prisma.mentor.findMany({
            select: {
                id: true,
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
    }
   
    async upsertSnapshotPeriod(params: UpsertPeriodParams) {
        const periodData = this.buildPeriodData(params);

        return this.prisma.group_monthly_snapshot.upsert({
            where: {
                group_id_year_month: {
                    group_id: params.group_id,
                    year: params.year,
                    month: params.month,
                },
            },
            update: {
                ...periodData,
                // Mentor: upsert vaqtida o'sha oy mentorini saqlaydi
                mentor_id: params.mentor_id ?? null,
                assistant_id: params.assistant_id ?? null,
                ...(params.period === 'full' ? { calculated_at: new Date() } : {}),
            },
            create: {
                group_id: params.group_id,
                year: params.year,
                month: params.month,
                mentor_id: params.mentor_id ?? null,
                assistant_id: params.assistant_id ?? null,
                ...periodData,
            },
        });
    }

    private buildPeriodData(params: UpsertPeriodParams) {
        const base = {
            active_count_start: params.active_count_start,
            active_count_end: params.active_count_end,
            joined_count: params.joined_count,
            churned_count: params.churned_count,
            transferred_out_count: params.transferred_out_count,
            transferred_in_count: params.transferred_in_count,
            company_churned_count: params.company_churned_count,
            mentor_churned_count: params.mentor_churned_count,
            retention_rate: params.retention_rate,
            churn_rate: params.churn_rate,
            company_churn_rate: params.company_churn_rate,
            mentor_churn_rate: params.mentor_churn_rate,
            ltv: params.ltv,
        };

        if (params.period === 'h1') {
            return {
                h1_active_count_start: base.active_count_start,
                h1_active_count_end: base.active_count_end,
                h1_joined_count: base.joined_count,
                h1_churned_count: base.churned_count,
                h1_transferred_out_count: base.transferred_out_count,
                h1_transferred_in_count: base.transferred_in_count,
                h1_company_churned_count: base.company_churned_count,
                h1_mentor_churned_count: base.mentor_churned_count,
                h1_retention_rate: base.retention_rate,
                h1_churn_rate: base.churn_rate,
                h1_company_churn_rate: base.company_churn_rate,
                h1_mentor_churn_rate: base.mentor_churn_rate,
                h1_ltv: base.ltv,
                h1_calculated_at: new Date(),
            };
        }

        if (params.period === 'h2') {
            return {
                h2_active_count_start: base.active_count_start,
                h2_active_count_end: base.active_count_end,
                h2_joined_count: base.joined_count,
                h2_churned_count: base.churned_count,
                h2_transferred_out_count: base.transferred_out_count,
                h2_transferred_in_count: base.transferred_in_count,
                h2_company_churned_count: base.company_churned_count,
                h2_mentor_churned_count: base.mentor_churned_count,
                h2_retention_rate: base.retention_rate,
                h2_churn_rate: base.churn_rate,
                h2_company_churn_rate: base.company_churn_rate,
                h2_mentor_churn_rate: base.mentor_churn_rate,
                h2_ltv: base.ltv,
                h2_calculated_at: new Date(),
            };
        }

        return base;
    }

    // =============================================
    // HELPER
    // =============================================

    buildYearMonthRange(
        startYear: number,
        startMonth: number,
        endYear: number,
        endMonth: number,
    ) {
        const conditions: any[] = [];
        for (let y = startYear; y <= endYear; y++) {
            const mStart = y === startYear ? startMonth : 1;
            const mEnd = y === endYear ? endMonth : 12;
            conditions.push({ year: y, month: { gte: mStart, lte: mEnd } });
        }
        return conditions;
    }
}