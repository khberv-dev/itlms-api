// seller-monthly-kpi.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class SellerMonthlyKpiRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async upsert(data: {
        seller_id: string;
        year: number;
        month: number;
        conversion_completed?: any;
        sale_sum?: number;
        sale_target?: number;
        sale_completed?: boolean;
        sale_count?: number;
    }) {
        const { seller_id, year, month, ...rest } = data;
        return this.prismaService.seller_monthly_kpi.upsert({
            where: { seller_id_year_month: { seller_id, year, month } },
            update: rest,
            create: { seller_id, year, month, ...rest },
        });
    }

    async findOne(seller_id: string, year: number, month: number) {
        return this.prismaService.seller_monthly_kpi.findUnique({
            where: { seller_id_year_month: { seller_id, year, month } },
        });
    }

    async findMany(year: number, month: number) {
        return this.prismaService.seller_monthly_kpi.findMany({
            where: { year, month },
            include: { seller: { include: { user: true } } },
        });
    }

    // Oylik sotuv summa va sonini olish
    async getSellerMonthlySale(seller_id: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate   = new Date(year, month, 0, 23, 59, 59, 999);
        const result = await this.prismaService.sale.aggregate({
            where: {
                seller_id,
                date: { gte: startDate, lte: endDate },
            },
            _sum:   { sum: true },
            _count: { id: true },
        });

        return {
            total_sum:   Number(result._sum.sum)   ?? 0,
            total_count: result._count.id  ?? 0,
        };
    }

    // Konversiya hisoblash uchun: leads va sotuvlar sonini olish
    async getConversionData(
        seller_id: string,
        fromDate: Date,
        toDate: Date,
    ): Promise<{ leads_count: number; sales_count: number }> {
        // Leadlar sonini seller_daily_statistic dan olamiz
        const statsRows = await this.prismaService.seller_daily_statistic.findMany({
            where: {
                seller_id,
                date: { gte: fromDate, lte: toDate },
            },
            select: { leads_count: true },
        });
        const leads_count = statsRows.reduce((s, r) => s + (r.leads_count ?? 0), 0);

        // Sotuvlar sonini sale jadvalidan olamiz
        const salesResult = await this.prismaService.sale.aggregate({
            where: {
                seller_id,
                date: { gte: fromDate, lte: toDate },
            },
            _count: { id: true },
        });
        const sales_count = salesResult._count.id ?? 0;

        return { leads_count, sales_count };
    }

async getSellerById(seller_id: string) {
  const now = new Date();

  return this.prismaService.seller.findUnique({
    where: { id: seller_id },
    include: {
      user: true,
      month_plans: {
        where: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      },
    },
  });
}
}