import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../_prisma/prisma.module';
import { GroupSnapshotController } from './group_monthly_snapshot.controller';
import { GroupSnapshotService } from './group_monthly_snapshot.service';
import { GroupSnapshotRepository } from './group_monthly_snapshot.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GroupSnapshotController],
  providers: [GroupSnapshotService, GroupSnapshotRepository],
  exports: [GroupSnapshotService],
})
export class GroupSnapshotModule {}