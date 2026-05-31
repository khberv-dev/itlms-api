import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../_prisma/prisma.service';
import { getYearAndMonth } from 'src/common/helpers/date';

@Injectable()
export class SellerMonthPlanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getMonthlyPlanSum(date: Date, seller_id) {
    const { year, month } = getYearAndMonth(date);
    const month_plan = await this.prismaService.seller_month_plan.findFirst({
      where: {
        year,
        month,
        seller_id,
      },
    });
    const plan = month_plan?.plan || 0;
    return +plan;
  }

  async setMonthlyPlan(plan: number, seller_id: string) {
    const { year, month } = getYearAndMonth();

    const existing_plan = await this.prismaService.seller_month_plan.findFirst({
      where: {
        year,
        month,
        seller_id,
      },
    });

    if (existing_plan) {
      return await this.prismaService.seller_month_plan.update({
        where: {
          id: existing_plan.id,
        },
        data: { plan },
      });
    } else {
      return await this.prismaService.seller_month_plan.create({
        data: { plan, seller_id },
        include: { seller: true },
      });
    }
  }

  async setPlanByDateRange(months, sum: number, seller_id: string, baseAmount, remainder) {
    return await this.prismaService.$transaction(
      months.map((item, index) =>
        this.prismaService.seller_month_plan.upsert({
          where: {
            seller_id_year_month: {
              seller_id,
              year: item.year,
              month: item.month,
            },
          },
          update: {
            plan: index === months.length - 1 ? baseAmount + remainder : baseAmount,
          },
          create: {
            seller_id,
            year: item.year,
            month: item.month,
            plan: index === months.length - 1 ? baseAmount + remainder : baseAmount,
          },
        }),
      ),
    );
  }
}
