import { Module } from '@nestjs/common';
import { PrismaModule } from '../_prisma/prisma.module';
import { SellerSalaryController } from './controllers/seller-salary.controller';
import { SellerDailyKpiRepository } from './repositories/seller-daily-kpi.repository';
import { SellerMonthlyKpiRepository } from './repositories/seller-monthly-kpi.repository';
import { SellerSalaryService } from './services/seller-salary.service';
import { SellerKpiService } from './services/seller-kpi.service';
import { SellerKpiController } from './controllers/seller-kpi-controller';
import { KpiTableController } from './controllers/kpi-table.controller';
import { KpiTableService } from './services/kpi-table.service';
import { KpiTableRepository } from './repositories/kpi-table.repository';

@Module({
  imports:[PrismaModule],
  controllers: [SellerSalaryController, SellerKpiController, KpiTableController],
  providers: [
    SellerKpiService, SellerDailyKpiRepository,
    SellerMonthlyKpiRepository, SellerSalaryService,
    KpiTableService, KpiTableRepository
],
  exports:[]
})
export class SellerSalaryModule {}
