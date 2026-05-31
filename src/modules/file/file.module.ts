import { Global, Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { StorageService } from './storage.service';
import { PrismaModule } from '../_prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [FileController],
  providers: [FileService, FileRepository, StorageService],
  exports: [FileService],
})
export class FileModule {}
