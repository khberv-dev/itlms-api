import { Module } from '@nestjs/common';
import { StudentFrozenController } from './student-frozen.controller';
import { StudentFrozenService } from './student-frozen.service';
import { StudentFrozenRepository } from './student-frozen.repository';
import { StudentStatusModule } from '../student-status/student-status.module';
import { PrismaModule } from '../_prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    StudentStatusModule, // StudentStatusService inject qilish uchun
  ],
  controllers: [StudentFrozenController],
  providers: [StudentFrozenService, StudentFrozenRepository],
  exports: [StudentFrozenService], // CronJob uchun
})
export class StudentFrozenModule {}
