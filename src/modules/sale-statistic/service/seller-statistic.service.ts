import { Injectable } from '@nestjs/common';
import { SellerStatisticRepository } from '../repositories/seller-statistic.repository';
@Injectable()
export class SellerStatisticService {
    constructor(
        private readonly sellerStatisticRepository: SellerStatisticRepository
    ) { }

    async getKpiCards(
        sellerId: string,
        start: Date,
        end: Date,
    ) {
        const salesAgg =
            await this.sellerStatisticRepository.getSalesAggregateByPeriod(
                sellerId,
                start,
                end,
            );

        const statsAgg =
            await this.sellerStatisticRepository.getDailyStatsAggregateByPeriod(
                sellerId,
                start,
                end,
            );

        const sale_sum = Number(salesAgg._sum.sum || 0);
        const sale_count = Number(salesAgg._count.id || 0);
        const leads_count = statsAgg._sum.leads_count || 0;

        const conversion = (!sale_count || !leads_count) ? 0 : (sale_count / leads_count) * 100

        const average_check = sale_count > 0 ? sale_sum / sale_count : 0;

        return {
            sale_sum,
            leads_count,
            sale_count,
            conversion: +conversion.toFixed(1),
            average_check: +average_check.toFixed(0),
        };
    }

    async getDailyTalkAndContacts(
        sellerId: string,
        start: Date,
        end: Date,
    ) {
        const data =
            await this.sellerStatisticRepository.getDailyTrendByPeriod(
                sellerId,
                start,
                end,
            );


        return data.map(d => ({
            date: d.date,
            talk_time: Math.round((d._sum.time || 0) / 60),
            talk_count: d._sum.total_count || 0,
        }));
    }

    async compareWithLastPeriod(
        sellerId: string,
        start: Date,
        end: Date,
    ) {
        // ---- 1) Oldingi davrni hisoblaymiz ----
        const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        const prevStart = new Date(start);
        prevStart.setDate(start.getDate() - daysDiff);

        const prevEnd = new Date(end);
        prevEnd.setDate(end.getDate() - daysDiff);

        // ---- 2) Joriy davr uchun ma’lumot ----
        const currentSales =
            await this.sellerStatisticRepository.getSalesAggregateByPeriod(sellerId, start, end);

        const currentStats =
            await this.sellerStatisticRepository.getDailyStatsAggregateByPeriod(sellerId, start, end);

        // ---- 3) Oldingi davr uchun ma’lumot ----
        const prevSales =
            await this.sellerStatisticRepository.getSalesAggregateByPeriod(sellerId, prevStart, prevEnd);

        const prevStats =
            await this.sellerStatisticRepository.getDailyStatsAggregateByPeriod(sellerId, prevStart, prevEnd);

        // ---- 4) Current metrics ----
        const currentTotalSales = Number(currentSales._sum.sum || 0);

        const currentLeads = currentStats._sum.leads_count || 0;

        const currentDeals = Number(currentSales._count.id || 0);

        const currentConversion = currentLeads ? (currentDeals / currentLeads) * 100 : 0;

        const currentAvgCheck = currentDeals ? currentTotalSales / currentDeals : 0;

        const currentTalkMinutes = Math.round((currentStats._sum.time || 0) / 60);

        // ---- 5) Previous metrics ----
        const prevTotalSales = Number(prevSales._sum.sum || 0);

        const prevLeads = prevStats._sum.leads_count || 0;

        const prevDeals = Number(prevSales._count.id || 0);

        const prevConversion = prevLeads ? (prevDeals / prevLeads) * 100 : 0;

        const prevAvgCheck = prevDeals ? prevTotalSales / prevDeals : 0;

        const prevTalkMinutes = Math.round((prevStats._sum.time || 0) / 60);

        // ---- 6) Foiz farqi ----
        return {
            current: {
                totalSales: +currentTotalSales.toFixed(0),
                conversionRate: +currentConversion.toFixed(1),
                averageCheck: +currentAvgCheck.toFixed(0),
                talkTimeMinutes: currentTalkMinutes,
            },
            previous: {
                totalSales: +prevTotalSales.toFixed(0),
                conversionRate: +prevConversion.toFixed(1),
                averageCheck: +prevAvgCheck.toFixed(0),
                talkTimeMinutes: prevTalkMinutes,
            },
            diffPercent: {
                totalSales: this.calculateDiffPercent(currentTotalSales, prevTotalSales),
                conversionRate: this.calculateDiffPercent(currentConversion, prevConversion),
                averageCheck: this.calculateDiffPercent(currentAvgCheck, prevAvgCheck),
                talkTime: this.calculateDiffPercent(currentTalkMinutes, prevTalkMinutes),
            },
        };
    }

    async getTodayStats(sellerId: string) {
        const stat = await this.sellerStatisticRepository.getTodayStats(sellerId);

        return {
            call_time: stat?.time || 0,
            call_count: stat?.total_count || 0,
            deal_closed: 0, // <-- bu yerda real ma'lumot bo'lishi kerak, lekin hozircha 0 qo'yilgan
            productivity: 0
        }
    }

    private calculateDiffPercent(current: number, prev: number) {
        if (!prev) return 0;
        return +(((current - prev) / prev) * 100).toFixed(1);
    }


}
