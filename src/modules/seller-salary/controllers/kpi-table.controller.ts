// kpi-table.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { KpiTableService } from '../services/kpi-table.service';

@Controller('kpi-table')
export class KpiTableController {
    constructor(private readonly kpiTableService: KpiTableService) {}

    /**
     * GET /kpi-table?year=2025&month=2
     * Barcha sotuvchilar jadvali
     */
    @Get()
    async getTable(
        @Query('year')  year?:  string,
        @Query('month') month?: string,
    ) {
        const now = new Date();
        return this.kpiTableService.getKpiTable(
            year  ? +year  : now.getFullYear(),
            month ? +month : now.getMonth() + 1,
        );
    }

    /**
     * GET /kpi-table/:seller_id?year=2025&month=2
     * Bitta sotuvchi jadvali (expand bo'lganda barcha detail)
     */
    @Get(':seller_id')
    async getSellerTable(
        @Param('seller_id') seller_id: string,
        @Query('year')  year?:  string,
        @Query('month') month?: string,
    ) {
        const now = new Date();
        return this.kpiTableService.getSellerKpiTable(
            seller_id,
            year  ? +year  : now.getFullYear(),
            month ? +month : now.getMonth() + 1,
        );
    }
}