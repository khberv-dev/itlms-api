import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class SellerStatisticRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getSalesAggregateByPeriod(sellerId: string, start: Date, end: Date) {
    return await this.prismaService.sale.aggregate({
      where: {
        seller_id: sellerId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        sum: true,
      },
      _count: {
        id: true,
      },
    });
  }

  async getDailyStatsAggregateByPeriod(sellerId: string, start: Date, end: Date) {
    return await this.prismaService.seller_daily_statistic.aggregate({
      where: {
        seller_id: sellerId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        leads_count: true,
        total_count: true,
        time: true,
      },
    });
  }

  async getDailyTrendByPeriod(sellerId: string, start: Date, end: Date) {
    return await this.prismaService.seller_daily_statistic.groupBy({
      by: ['date'],
      where: {
        seller_id: sellerId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        time: true,
        total_count: true, // <-- calls made / contacts
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getTodayStats(sellerId: string) {
    const today = new Date();

    return await this.prismaService.seller_daily_statistic.findFirst({
      where: {
        seller_id: sellerId,
        date: today,
      },
      select: {
        id: true,
        total_count: true,
        time: true,
      },
    });
  }
}
