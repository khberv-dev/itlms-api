import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { StudentRepository } from './student.repository';
import { UserModule } from 'src/modules/user/user.module';
import { StudentController } from './student.controller';
import { StudentStatusModule } from '../student-status/student-status.module';

@Module({
  imports:[PrismaModule, UserModule, StudentStatusModule],
  controllers: [StudentController],
  providers: [StudentService,StudentRepository],
  exports:[StudentService]
})
export class StudentModule {}