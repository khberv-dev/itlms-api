import { Module } from '@nestjs/common';
import { StudentStatusController } from './student-status.controller';
import { StudentStatusService } from './studnet-status.service';
import { StudentStatusRepository } from './student-status.repository';
import { PrismaModule } from '../_prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentStatusController],
  providers: [StudentStatusService, StudentStatusRepository],
  exports: [StudentStatusService],
})
export class StudentStatusModule {}
