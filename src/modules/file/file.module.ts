import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { StorageService } from './storage.service';
import { PrismaModule } from '../_prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileRepository, StorageService],
  exports: [FileService], // Boshqa modullar import qilishi uchun
})
export class FileModule {}