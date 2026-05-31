import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { GroupRepository } from './group.repository';
import { GroupController } from './group.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GroupController],
  providers: [GroupService, GroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
