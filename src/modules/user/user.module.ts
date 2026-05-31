import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../_prisma/prisma.module';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
