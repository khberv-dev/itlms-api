import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { SaleRepository } from './sale.repository';
import { StudentModule } from '../student/student.module';
import { SaleController } from './sale.controller';
import { GoogleSheetsService } from './sale-sheet.service';

@Module({
  imports:[PrismaModule, StudentModule],
  controllers: [SaleController],
  providers: [SaleService,SaleRepository,GoogleSheetsService],
  exports:[SaleService]
})
export class SaleModule {}