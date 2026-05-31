// kpi-table.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class KpiTableRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** Barcha sotuvchilar (level bilan) */
    async getSellers() {
        return this.prisma.seller.findMany({
            include: {
                user: { select: { id: true, first_name: true, last_name: true } },
            },
            orderBy: { user: { first_name: 'asc' } },
        });
    }

    /**
     * Bir sotuvchining butun oydagi daily_kpi rekordlari
     * (bitta query — jadval uchun barcha kunlar)
     */
    async getSellerDailyKpis(seller_id: string, year: number, month: number) {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));

        return this.prisma.seller_daily_kpi.findMany({
            where: {
                seller_id,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });
    }

    /**
     * Bir sotuvchining oydagi har kunlik sotuv summasi va soni
     * (sale jadvalidan, kunlik GROUP BY)
     */
    async getSellerDailySales(seller_id: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Raw query — Prisma groupBy date uchun qulay
        const rows = await this.prisma.$queryRaw<
            { day: Date; sale_sum: bigint; sale_count: bigint }[]
        >`
            SELECT
                DATE(date)       AS day,
                SUM(sum)         AS sale_sum,
                COUNT(id)        AS sale_count
            FROM   sale
            WHERE  seller_id = ${seller_id}
              AND  date >= ${startDate}
              AND  date <= ${endDate}
            GROUP  BY DATE(date)
        `;

        // { "2025-02-01": { sum, count } } map qilish
        const map: Record<string, { sum: number; count: number }> = {};
        for (const r of rows) {
            const key = r.day.toISOString().slice(0, 10);
            map[key] = {
                sum: Number(r.sale_sum),
                count: Number(r.sale_count),
            };
        }
        return map;
    }

    /**
     * Bir sotuvchining oydagi har kunlik konversiya
     * (seller_daily_statistic dan leads_count, sale jadvalidan sales_count)
     * leads_count kunlik statdan keladi
     */
    async getSellerDailyLeads(seller_id: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const rows = await this.prisma.seller_daily_statistic.findMany({
            where: {
                seller_id,
                date: { gte: startDate, lte: endDate },
            },
            select: { date: true, leads_count: true },
        });

        const map: Record<string, number> = {};
        for (const r of rows) {
            const key = new Date(r.date).toISOString().slice(0, 10);
            map[key] = r.leads_count ?? 0;
        }
        return map;
    }

    /** Oylik KPI rekordini olish (oylik ball uchun) */
    async getMonthlyKpi(seller_id: string, year: number, month: number) {
        return this.prisma.seller_monthly_kpi.findUnique({
            where: { seller_id_year_month: { seller_id, year, month } },
        });
    }
}