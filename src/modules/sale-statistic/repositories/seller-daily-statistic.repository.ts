import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';

@Injectable()
export class SellerDailyStatisticRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getSellersWhithAmocrmId() {
    return await this.prismaService.seller.findMany({
      where: { amocrm_id: { not: null } },
      select: { id: true, amocrm_id: true },
    });
  }

  async getSellers() {
    return await this.prismaService.seller.findMany({
      select: { id: true, sip: true, amocrm_id: true },
    });
  }

  async createSellerDailyStatistic(data: { seller_id: string; date: Date; leads_count: number }) {
    return await this.prismaService.seller_daily_statistic.create({
      data,
      include: { seller: true },
    });
  }

  async updateLeadsCountByDateAndSellerId(date: Date, seller_id: string, leads_count: number) {
    return await this.prismaService.seller_daily_statistic.update({
      where: {
        seller_id_date: {
          seller_id,
          date,
        },
      },
      data: { leads_count },
    });
  }

  async upsert(stat: any) {
    if (!stat.total_count && !stat.leads_count) return;

    const { seller_id, date, ...data } = stat;

    return this.prismaService.seller_daily_statistic.upsert({
      where: {
        seller_id_date: {
          seller_id,
          date,
        },
      },
      update: data,
      create: stat,
    });
  }

  async deleteSellerDailyStatisticByDate(date: Date = new Date()) {
    return await this.prismaService.seller_daily_statistic.deleteMany({
      where: { date },
    });
  }
}
