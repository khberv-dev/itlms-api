import { Module } from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { PrismaModule } from '../../_prisma/prisma.module';
import { AdministrationRepository } from './administration.repository';
import { UserModule } from 'src/modules/user/user.module';
import { AdministrationController } from './administration.controller';

@Module({
  imports:[PrismaModule, UserModule],
  controllers: [AdministrationController],
  providers: [AdministrationService,AdministrationRepository],
  exports:[AdministrationService]
})
export class AdministrationModule {}