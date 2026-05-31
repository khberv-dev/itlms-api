import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { SaleRepository } from './sale.repository';
import { StudentModule } from '../student/student.module';
import { SaleController } from './sale.controller';

@Module({
  imports: [PrismaModule, StudentModule],
  controllers: [SaleController],
  providers: [SaleService, SaleRepository],
  exports: [SaleService],
})
export class SaleModule {}
