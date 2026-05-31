import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceController } from './attendance.controller';

@Module({
  imports:[PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService,AttendanceRepository],
  exports:[AttendanceService]
})
export class AttendanceModule {}