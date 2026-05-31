import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../_prisma/prisma.service';
import { getYearAndMonth } from 'src/common/helpers/date';

@Injectable()
export class SaleStatisticRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async calculateDailySaleSum(date: Date) {
    const today_sales = await this.prismaService.sale.aggregate({
      _sum: {
        sum: true,
      },
      where: {
        created_at: {
          gte: date,
        },
      },
    });
    const today_sum = today_sales?._sum?.sum || 0;
    return +today_sum;
  }

  async calculateMonthlySaleSum(start_of_month: Date, end_of_month: Date) {
    const month_sales = await this.prismaService.sale.aggregate({
      _sum: {
        sum: true,
      },
      where: {
        created_at: {
          gte: start_of_month,
          lte: end_of_month,
        },
      },
    });
    const month_sum = month_sales?._sum?.sum || 0;
    return +month_sum;
  }

  async getMonthlyPlanSum(date: Date) {
    const { year, month } = getYearAndMonth(date);

    const result = await this.prismaService.seller_month_plan.aggregate({
      where: {
        year,
        month,
      },
      _sum: {
        plan: true,
      },
    });

    return +(result._sum.plan || 0);
  }

  async getAllSellers() {
    return await this.prismaService.seller.findMany({
      include: {
        user: true,
      },
      where: {
        user: {
          role: 'seller',
        },
      },
    });
  }

  async getSellerMonthlySaleSum(seller_id: string, from: Date, to: Date) {
    const sales = await this.prismaService.sale.aggregate({
      where: {
        seller_id: seller_id,
        date: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        sum: true,
      },
      _count: true,
    });
    const sum = sales?._sum?.sum || 0;
    const count = sales?._count || 0;
    return { sale_sum: +sum, sale_count: count };
  }

  async getSellerMonthPlan(seller_id: string, date: Date) {
    const { year, month } = getYearAndMonth(date);

    const month_plan = await this.prismaService.seller_month_plan.findFirst({
      where: {
        seller_id,
        year,
        month,
      },
    });

    const plan = month_plan?.plan || 0;
    return +plan;
  }

  async getSellerLeadsCount(seller_id: string, from: Date, to: Date) {
    const leads = await this.prismaService.seller_daily_statistic.aggregate({
      where: {
        seller_id: seller_id,
        date: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        leads_count: true,
      },
    });
    const leads_count = leads?._sum?.leads_count || 0;
    return +leads_count;
  }

  async getDailySales(from: Date, to: Date) {
    return await this.prismaService.sale.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        sum: true,
      },
    });
  }

  async getYearPlan(year: number) {
    const rows = await this.prismaService.seller_month_plan.groupBy({
      by: ['year', 'month'],
      where: { year },
      _sum: {
        plan: true,
        sale: true,
      },
      orderBy: { month: 'asc' },
    });

    return rows.map((row) => ({
      id: `${row.year}-${row.month}`,
      year: row.year,
      month: row.month,
      plan: row._sum.plan ?? 0,
      sale: row._sum.sale ?? 0,
    }));
  }

  async getYearlySales(year: number) {
    return this.prismaService.$queryRaw`
             SELECT 
               EXTRACT(MONTH FROM month_start)::INT as month,
               SUM(sum) as total
             FROM (
               SELECT 
                 date_trunc('month', date) as month_start,
                 sum
               FROM sale
               WHERE date BETWEEN ${new Date(`${year}-01-01`)} 
                 AND ${new Date(`${year}-12-31`)}
             ) t
             GROUP BY month_start
             ORDER BY month_start ASC;
            `;
  }

  async getMonthlyConversion(start_date: Date, end_date: Date) {
    const result = await this.prismaService.$queryRaw<{ month: number; conversion: number }[]>`
                WITH leads AS (
                  SELECT 
                    DATE_TRUNC('month', date) AS month_date,
                    SUM(leads_count)::int AS total_leads
                  FROM seller_daily_statistic
                  WHERE date BETWEEN ${start_date} AND ${end_date}
                  GROUP BY 1
                ),
                sales AS (
                  SELECT 
                    DATE_TRUNC('month', date) AS month_date,
                    COUNT(id)::int AS total_sales
                  FROM sale
                  WHERE date BETWEEN ${start_date} AND ${end_date}
                  GROUP BY 1
                )
                SELECT 
                  EXTRACT(MONTH FROM COALESCE(l.month_date, s.month_date))::int AS month,
                  CASE 
                    WHEN COALESCE(l.total_leads, 0) = 0 THEN 0
                    ELSE ROUND(
                      (COALESCE(s.total_sales, 0)::decimal 
                      / COALESCE(l.total_leads, 0)) * 100,
                      2
                    )
                  END AS conversion
                FROM leads l
                FULL OUTER JOIN sales s 
                  ON l.month_date = s.month_date
                ORDER BY month;
            `;

    return result;
  }

  async getSalesByAddress(start_date: Date, end_date: Date) {
    return this.prismaService.$queryRaw<{ address: string; count: number; total_sum: string }[]>`
            SELECT 
              s.address,
              COUNT(sa.id)::int AS count,
              COALESCE(SUM(sa.sum), 0) AS total_sum
            FROM sale sa
            JOIN student s ON s.id = sa.student_id
            WHERE sa.date BETWEEN ${start_date} AND ${end_date}
            GROUP BY s.address
            ORDER BY count DESC;
       `;
  }

  async getSalesByJob(start_date: Date, end_date: Date) {
    return this.prismaService.$queryRaw<{ job: string; count: number }[]>`
            SELECT 
              s.job,
              COUNT(sa.id)::int AS count
            FROM sale sa
            JOIN student s ON s.id = sa.student_id
            WHERE sa.date BETWEEN ${start_date} AND ${end_date}
            GROUP BY s.job
            ORDER BY count DESC;
        `;
  }

  async getSellersByAverageCheck(start_date: Date, end_date: Date) {
    return this.prismaService.$queryRaw<
      {
        seller_id: string;
        first_name: string;
        last_name: string;
        average_check_sum: number;
        overall_average: number;
        is_above_average: boolean;
      }[]
    >`
        WITH seller_stats AS (
            SELECT 
                sel.id AS seller_id,
                u.first_name,
                u.last_name,
                AVG(sa.sum) AS avg_sum
            FROM sale sa
            JOIN seller sel ON sel.id = sa.seller_id
            JOIN "user" u ON u.id = sel.user_id
            WHERE sa.date BETWEEN ${start_date} AND ${end_date}
            GROUP BY sel.id, u.first_name, u.last_name
        ),
        overall AS (
            SELECT AVG(sum) AS overall_avg
            FROM sale
            WHERE date BETWEEN ${start_date} AND ${end_date}
        )
        SELECT 
            ss.seller_id,
            ss.first_name,
            ss.last_name,
            ROUND(ss.avg_sum::numeric, 2) AS average_check_sum,
            ROUND(o.overall_avg::numeric, 2) AS overall_average,
            ss.avg_sum >= o.overall_avg AS is_above_average
        FROM seller_stats ss, overall o
        ORDER BY ss.avg_sum DESC;
    `;
  }

  async getTopPerformersData(start_date: Date, end_date: Date) {
    // 1. Har bir seller uchun statistikani bazaning o'zida yig'amiz (Sum)
    const stats = await this.prismaService.seller_daily_statistic.groupBy({
      by: ['seller_id'],
      where: {
        date: { gte: start_date, lte: end_date },
      },
      _sum: {
        succes_count: true,
        total_count: true,
        time: true,
      },
    });

    // 2. Har bir seller uchun sotuvlar summasini bazada yig'amiz
    const sales = await this.prismaService.sale.groupBy({
      by: ['seller_id'],
      where: {
        date: { gte: start_date, lte: end_date },
      },
      _sum: {
        sum: true,
      },
    });

    // 3. Sotuvchilarning shaxsiy ma'lumotlarini (ism-sharif) olamiz
    const sellers = await this.prismaService.seller.findMany({
      include: {
        user: {
          select: { first_name: true, last_name: true, avatar_url: true },
        },
      },
    });

    return { stats, sales, sellers };
  }
}
