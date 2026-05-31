import { Injectable } from '@nestjs/common';
import { SaleStatisticRepository } from '../repositories/sale-statistic.repository';

@Injectable()
export class SaleStatisticService {
  constructor(private readonly saleStatisticRepository: SaleStatisticRepository) {}

  async calculateSaleStatisticByMonth() {
    const now = new Date();
    const start_of_today = new Date(now);
    start_of_today.setHours(0, 0, 0, 0);
    const start_of_month = new Date(now.getFullYear(), now.getMonth(), 1);
    const end_of_month = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const daily_sale_sum = await this.saleStatisticRepository.calculateDailySaleSum(start_of_today);
    const monthly_sale_sum = await this.saleStatisticRepository.calculateMonthlySaleSum(start_of_month, end_of_month);
    const monthly_plan = await this.saleStatisticRepository.getMonthlyPlanSum(start_of_month);
    const daily_plan = Math.round(+monthly_plan / end_of_month.getDate());
    const plan_percent = this.calcPerformance(monthly_sale_sum, monthly_plan);
    const speed_difference = this.calculateSpeedDifference(now, end_of_month, plan_percent);

    return {
      daily_sale_sum,
      monthly_sale_sum,
      monthly_plan,
      daily_plan,
      plan_percent,
      speed_difference,
      expected_plan_performance: Math.round((now.getDate() / end_of_month.getDate()) * 100),
    };
  }

  async calculateSellersRating(start_date: string, end_date: string) {
    const from = new Date(start_date);
    const to = new Date(end_date);
    to.setHours(23, 59, 59, 999);

    const sellers = await this.saleStatisticRepository.getAllSellers();

    const result: any[] = [];

    await Promise.all(
      sellers.map(async (seller) => {
        const [{ sale_sum, sale_count }, plan, leads_count] = await Promise.all([
          this.saleStatisticRepository.getSellerMonthlySaleSum(seller.id, from, to),
          this.saleStatisticRepository.getSellerMonthPlan(seller.id, from),
          this.saleStatisticRepository.getSellerLeadsCount(seller.id, from, to),
        ]);

        const plan_percent = this.calcPerformance(sale_sum, plan);

        result.push({
          seller_id: seller.id,
          full_name: seller.user?.first_name + ' ' + seller.user?.last_name,
          sale_sum,
          plan,
          avatar: seller.user?.avatar_url,
          conversion: this.calcConversion(sale_count, leads_count),
          plan_percent,
          speed_difference: this.calculateSpeedDifference(new Date(), to, plan_percent),
        });
      }),
    );

    return result.sort((a, b) => b.sale_sum - a.sale_sum);
  }

  async getDailySalesSummary(start_date: string, end_date: string) {
    const from = new Date(start_date);
    let to = new Date(end_date);
    const today = new Date();

    const is_current_month =
      from.getFullYear() === today.getFullYear() &&
      from.getMonth() === today.getMonth() &&
      to.getFullYear() === today.getFullYear() &&
      to.getMonth() === today.getMonth();

    if (is_current_month) {
      to = new Date(today);
    }

    to.setHours(23, 59, 59, 999);

    const days_in_month = to.getDate();

    const [plan_sum, daily_sales, today_sum] = await Promise.all([
      this.saleStatisticRepository.getMonthlyPlanSum(from),
      this.saleStatisticRepository.getDailySales(from, to),
      this.saleStatisticRepository.calculateDailySaleSum(today),
    ]);

    const daily_plan = Math.round(plan_sum / days_in_month);

    const sales_map = this.mapDailySales(daily_sales);

    const chart: any[] = [];
    let completed_days = 0;

    for (let day = 1; day <= days_in_month; day++) {
      const sale = sales_map.get(day) ?? 0;
      const is_completed = sale >= daily_plan;

      if (is_completed) completed_days++;

      chart.push({
        day,
        sale,
        plan: daily_plan,
        is_completed,
      });
    }

    return {
      daily_plan,
      today_sum,
      difference: today_sum - daily_plan,
      completed_days,
      total_days: days_in_month,
      chart,
    };
  }

  async getYearlyDynamics(year: number) {
    const sales: any = await this.saleStatisticRepository.getYearlySales(year);
    const plans = await this.saleStatisticRepository.getYearPlan(year);

    // Yillik jami sotuv
    const totalSales = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);

    // Yillik reja
    const yearPlan = plans.reduce((acc, p) => acc + Number(p.plan || 0), 0);

    // O‘tgan yil bilan solishtirish
    const lastYearSales: any = await this.saleStatisticRepository.getYearlySales(year - 1);

    const lastYearTotal = lastYearSales.reduce((acc, s) => acc + Number(s.total || 0), 0);

    const growthPercent = lastYearTotal > 0 ? ((totalSales - lastYearTotal) / lastYearTotal) * 100 : 0;

    // Reja bajarilishi %
    const planCompletionPercent = yearPlan > 0 ? (totalSales / yearPlan) * 100 : 0;

    // ✅ ENG YAXSHI OY (REAL DATE GA ASOSAN)
    let bestMonth = { month: 1, amount: 0 };

    sales.forEach((s) => {
      const amount = Number(s.total || 0);
      if (amount > bestMonth.amount) {
        bestMonth = { month: s.month, amount };
      }
    });

    // ✅ OYMA-OY GRAFIK UCHUN DATA
    const monthlyData = sales.map((s) => {
      const planForMonth = plans.find((p) => p.month === s.month);

      return {
        month: s.month,
        sales: Number(s.total || 0),
        plan: planForMonth ? Number(planForMonth.plan) : 0,
      };
    });

    return {
      year,
      totalSales,
      growthPercent: +growthPercent.toFixed(1),
      yearPlan,
      planCompletionPercent: +planCompletionPercent.toFixed(1),
      bestMonth,
      monthlyData,
    };
  }

  async getMonthlyConversion(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return this.saleStatisticRepository.getMonthlyConversion(startDate, endDate);
  }

  async getSalesByAddress(start: string, end: string) {
    return this.saleStatisticRepository.getSalesByAddress(new Date(start), new Date(end));
  }

  async getSalesByJob(start: string, end: string) {
    return this.saleStatisticRepository.getSalesByJob(new Date(start), new Date(end));
  }

  async getSellersByAverageCheck(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const data = await this.saleStatisticRepository.getSellersByAverageCheck(startDate, endDate);

    if (!data.length) {
      return {
        sellers: [],
        overall_average: 0,
      };
    }

    const overall_average = data[0].overall_average;

    return {
      overall_average,
      sellers: data.map(({ overall_average, ...seller }) => seller),
    };
  }

  async getTopPerformers(start_date: string, end_date: string) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const { stats, sales, sellers } = await this.saleStatisticRepository.getTopPerformersData(startDate, endDate);

    const result = sellers.map((seller) => {
      // Shu sellerga tegishli statistikani topamiz
      const sellerStats = stats.find((s) => s.seller_id === seller.id);
      const sellerSales = sales.find((s) => s.seller_id === seller.id);

      const deals = sellerStats?._sum?.succes_count || 0;
      const totalLeads = sellerStats?._sum?.total_count || 0;
      const totalAmount = sellerSales?._sum?.sum?.toNumber() || 0;

      return {
        id: seller.id,
        first_name: seller.user.first_name,
        last_name: seller.user.last_name,
        avatar_url: seller.user.avatar_url,
        deals: deals,
        percent: totalLeads > 0 ? parseFloat(((deals / totalLeads) * 100).toFixed(1)) : 0,
        call_hours: parseFloat(((sellerStats?._sum?.time || 0) / 3600).toFixed(1)),
        total_amount: totalAmount,
      };
    });

    return result.sort((a, b) => b.total_amount - a.total_amount);
  }

  // ---------------- HELPERS ----------------

  private calcConversion(sales: number, leads: number): number {
    if (!leads) return 0;
    return Math.round((sales / leads) * 100);
  }

  private calcPerformance(sale: number, plan: number): number {
    if (!plan) return 0;
    return Math.round((sale / plan) * 100);
  }

  private calculateSpeedDifference(now: Date, end_of_month: Date, plan_percent: number) {
    const total_days_in_month = end_of_month.getDate();
    const passed_days = now.getDate();

    const ideal_percent = (passed_days / total_days_in_month) * 100;
    const speed_difference = plan_percent - ideal_percent;
    return Math.round(speed_difference);
  }

  private mapDailySales(data): Map<number, number> {
    const map = new Map<number, number>();

    for (const row of data) {
      const day = row.date.getDate();
      map.set(day, Number(row._sum.sum ?? 0));
    }

    return map;
  }
}
