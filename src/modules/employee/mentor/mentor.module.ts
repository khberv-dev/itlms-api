import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { PrismaModule } from '../../_prisma/prisma.module';
import { MentorRepository } from './mentor.repository';
import { UserModule } from 'src/modules/user/user.module';
import { MentorController } from './mentor.controller';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [MentorController],
  providers: [MentorService, MentorRepository],
  exports: [MentorService],
})
export class MentorModule {}
