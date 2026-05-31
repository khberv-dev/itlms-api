import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { PrismaModule } from '../../_prisma/prisma.module';
import { SellerRepository } from './seller.repository';
import { UserModule } from 'src/modules/user/user.module';
import { SellerController } from './seller.controller';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SellerController],
  providers: [SellerService, SellerRepository],
  exports: [SellerService],
})
export class SellerModule {}
