import { Injectable } from '@nestjs/common';
import { SellerMonthlyKpiRepository } from '../repositories/seller-monthly-kpi.repository';
import { SellerKpiService } from './seller-kpi.service';
import { LEVEL_TARGETS } from './kpi.constanta';

@Injectable()
export class SellerSalaryService {
  constructor(
    private readonly sellerMonthlyKpiRepository: SellerMonthlyKpiRepository,
    private readonly sellerKpiService: SellerKpiService,
  ) {}

  async calculateSellerSalary(seller_id: string, month: number, year: number) {
    const seller = await this.sellerMonthlyKpiRepository.getSellerById(seller_id);
    const bonus_score: any = await this.sellerKpiService.calculateSellerKpiScore(seller_id, year, month);
    const { total_sum } = await this.sellerMonthlyKpiRepository.getSellerMonthlySale(seller_id, year, month);

    const bonus_sum = LEVEL_TARGETS[seller?.level as any]?.kpi_sum * (bonus_score / 100);
    const base_sum = this.caclulateSellerSalaryBySale(total_sum);

    return {
      bonus: base_sum,
      base_salary: Number(bonus_sum) || 0,
      total_salary: base_sum + (Number(bonus_sum) || 0),
      plan_salary:
        LEVEL_TARGETS[seller?.level as any].kpi_sum +
        this.caclulateSellerSalaryBySale(Number(seller?.month_plans[0]?.plan) || 0),
    };
  }

  caclulateSellerSalaryBySale(sum: number) {
    if (sum < 30000000) return sum * 0.04;
    if (sum < 50000000) return sum * 0.05;
    if (sum < 70000000) return sum * 0.06;
    if (sum < 90000000) return sum * 0.07;
    if (sum < 100000000) return sum * 0.08;
    if (sum < 110000000) return sum * 0.09;
    return sum * 0.1;
  }
}
