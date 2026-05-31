import { Module } from '@nestjs/common';
import { PrismaModule } from '../_prisma/prisma.module';
import { SaleStatisticService } from './service/sale-statistic.service';
import { SaleStatisticRepository } from './repositories/sale-statistic.repository';
import { SellerDailyStatisticService } from './service/seller-daily-statistic.service';
import { SaleStatisticController } from './controllers/sale-statistic.controller';
import { SellerDailyStatisticRepository } from './repositories/seller-daily-statistic.repository';
import { SellerMonthPlanService } from './service/seller-mont-plan.service';
import { SellerMonthPlanRepository } from './repositories/seller-month-plan.repository';
import { SellerMonthPlanController } from './controllers/seller-month-plan.controller';
import { SellerStatisticService } from './service/seller-statistic.service';
import { SellerStatisticRepository } from './repositories/seller-statistic.repository';
import { SellerStatisticController } from './controllers/seller-statistic.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SaleStatisticController, SellerMonthPlanController, SellerStatisticController],
  providers: [
    SaleStatisticService,
    SaleStatisticRepository,
    SellerDailyStatisticService,
    SellerDailyStatisticRepository,
    SellerMonthPlanService,
    SellerMonthPlanRepository,
    SellerStatisticService,
    SellerStatisticRepository,
  ],
  exports: [],
})
export class SaleStatisticModule {}
