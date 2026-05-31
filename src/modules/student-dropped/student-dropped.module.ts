import { Module } from '@nestjs/common';
import { StudentDroppedController } from './student-dropped.controller';
import { StudentDroppedService } from './student-dropped.service';
import { StudentDroppedRepository } from './student-dropped.repository';
import { StudentStatusModule } from '../student-status/student-status.module';
import { PrismaModule } from '../_prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    StudentStatusModule,
  ],
  controllers: [StudentDroppedController],
  providers: [StudentDroppedService, StudentDroppedRepository],
  exports: [StudentDroppedService],
})
export class StudentDroppedModule {}