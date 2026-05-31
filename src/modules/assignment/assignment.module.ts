import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { AssignmentRepository } from './assignment.repository';
import { AssignmentController } from './assignment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentRepository],
  exports: [AssignmentService],
})
export class AssignmentModule {}
