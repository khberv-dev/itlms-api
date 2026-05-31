// seller-daily-kpi.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class SellerDailyKpiRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async upsert(data: {
    seller_id: string;
    date: Date;
    started_time?: string;
    started_time_target?: string;
    started_on_time?: boolean;
    qa_passed?: boolean;
    calls_count?: number;
    calls_target?: number;
    calls_done?: boolean;
    talk_time_seconds?: number;
    talk_time_target?: number;
    talk_time_done?: boolean;
  }) {
    const { seller_id, date, ...rest } = data;
    return this.prismaService.seller_daily_kpi.upsert({
      where: { seller_id_date: { seller_id, date } },
      update: rest,
      create: { seller_id, date, ...rest },
    });
  }

  // Oy boshida bulk create — shu oyning barcha kunlari uchun
  async bulkCreateMonthDays(
    seller_id: string,
    year: number,
    month: number,
    calls_target: number,
    talk_time_target: number,
  ) {
    const daysInMonth = new Date(year, month, 0).getDate(); // oxirgi kun soni
    const records: any[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      records.push({
        seller_id,
        date,
        calls_target,
        talk_time_target,
        started_time_target: '10:00',
      });
    }

    // skipDuplicates — qayta chaqirilganda xato bermasin
    return this.prismaService.seller_daily_kpi.createMany({
      data: records,
      skipDuplicates: true,
    });
  }

  async findOne(seller_id: string, date: Date) {
    return this.prismaService.seller_daily_kpi.findUnique({
      where: { seller_id_date: { seller_id, date } },
    });
  }

  // Oyning barcha kunlik KPI larini olish (ball hisoblash uchun)
  async findMonthDays(seller_id: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.prismaService.seller_daily_kpi.findMany({
      where: {
        seller_id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  // Shu oy uchun to'ldirilgan (call_count > 0) kunlar — umumiy call va time statistikasi
  async getMonthlyCallSummary(seller_id: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await this.prismaService.seller_daily_kpi.aggregate({
      where: {
        seller_id,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { calls_count: true, talk_time_seconds: true },
      _count: { id: true },
      _avg: { calls_count: true, talk_time_seconds: true },
    });

    return {
      total_calls: result._sum.calls_count ?? 0,
      total_talk_seconds: result._sum.talk_time_seconds ?? 0,
      total_days: result._count.id ?? 0,
      avg_calls_per_day: result._avg.calls_count ?? 0,
      avg_talk_per_day: result._avg.talk_time_seconds ?? 0,
    };
  }

  async getSellersCallsCount(seller_id: string, date: Date) {
    return this.prismaService.seller_daily_statistic.findFirst({
      where: { seller_id, date },
      select: { total_count: true, time: true, leads_count: true },
    });
  }

  async getSellers() {
    return this.prismaService.seller.findMany({
      include: { user: true },
    });
  }
}
