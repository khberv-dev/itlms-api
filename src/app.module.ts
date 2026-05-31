import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';

import configuration from './config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { SellerModule } from './modules/employee/seller/seller.module';
import { StudentModule } from './modules/student/student.module';
import { SaleModule } from './modules/sale/sale.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SaleStatisticModule } from './modules/sale-statistic/sale-statistic.module';
import { MentorModule } from './modules/employee/mentor/mentor.module';
import { GroupModule } from './modules/group/group.module';
import { FileModule } from './modules/file/file.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SellerSalaryModule } from './modules/seller-salary/saller-salary.module';
import { AdministrationModule } from './modules/employee/administration/administration.module';
import { WebSocketModule } from './modules/web-socket/web-socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { StudentStatusModule } from './modules/student-status/student-status.module';
import { StudentFrozenModule } from './modules/student-frozen/student-frozen.module';
import { StudentDroppedModule } from './modules/student-dropped/student-dropped.module';
import { GroupSnapshotModule } from './modules/group_monthly_snapshot/group_monthly_snapshot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    ScheduleModule.forRoot(),
    AdministrationModule,
    AssignmentModule,
    AttendanceModule,
    AuthModule,
    FileModule,
    GroupModule,
    GroupSnapshotModule,
    MentorModule,
    SaleModule,
    SaleStatisticModule,
    SellerModule,
    SellerSalaryModule,
    StudentModule,
    StudentDroppedModule,
    StudentFrozenModule,
    StudentStatusModule,
    UserModule,
    WebSocketModule,
  ],
})
export class AppModule {}
