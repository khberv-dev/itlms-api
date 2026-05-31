import { Injectable } from '@nestjs/common';
import { getFirstDayOfMonth } from 'src/common/helpers/date';
import { SellerMonthPlanRepository } from '../repositories/seller-month-plan.repository';
@Injectable()
export class SellerMonthPlanService {
    constructor(
        private readonly sellerMonthPlanRepository: SellerMonthPlanRepository,
    ) { }

    async getMonthlyPlanSum(start_of_month: string, seller_id: string) {
        const date = getFirstDayOfMonth(new Date(start_of_month));
        return await this.sellerMonthPlanRepository.getMonthlyPlanSum(date, seller_id);
    }

    async setMonthlyPlan(
        start_date: Date,
        end_date: Date,
        sum: number,
        seller_id: string,
    ) {
        const months = this.getMonthsBetween(start_date, end_date);

        if (!months.length) {
            throw new Error('Date range noto‘g‘ri');
        }

        const { baseAmount, remainder } = this.calculateMonthlyAmount(
            sum,
            months.length,
        );

        return await this.sellerMonthPlanRepository.setPlanByDateRange(
            months,
            sum,
            seller_id,
            baseAmount,
            remainder
        );
    }

    private getMonthsBetween(start_date: Date, end_date: Date) {
        const start = new Date(start_date);
        const end = new Date(end_date);

        const months: { year: number; month: number }[] = [];

        const current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (
            current.getFullYear() < end.getFullYear() ||
            (current.getFullYear() === end.getFullYear() &&
                current.getMonth() <= end.getMonth())
        ) {
            months.push({
                year: current.getFullYear(),
                month: current.getMonth() + 1,
            });

            current.setMonth(current.getMonth() + 1);
        }

        return months;
    }

    private calculateMonthlyAmount(sum: number, monthCount: number) {
        const baseAmount = Math.floor(sum / monthCount);
        const remainder = sum - baseAmount * monthCount;

        return { baseAmount, remainder };
    }


}
