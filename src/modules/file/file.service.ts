import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StorageService } from './storage.service';
import { FileRepository } from './file.repository';
import { FileResponseDto, UploadFileDto } from './dto';
import { file } from '@prisma/client';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly fileRepository: FileRepository,
  ) {}

  /**
   * Fayl yuklash:
   * 1. Storage ga yuklaydi
   * 2. DB ga saqlaydi (is_active: false by default)
   * 3. File objectni qaytaradi
   *
   * Keyin boshqa modul (user avatar, task file) bu faylni
   * o'z modeliga bog'laydi va activate() ni chaqiradi
   */
  async upload(file: Express.Multer.File, dto: UploadFileDto = {}, delete_id?: string): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('Fayl yuklanmadi');
    }

    const folder = dto.folder ?? 'uploads';

    // 1. Storage ga yuklash
    const { key, url, bucket } = await this.storageService.upload(file, folder);

    // 2. DB ga saqlash
    const savedFile = await this.fileRepository.create({
      key,
      url,
      bucket,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      is_active: dto.is_active ?? false,
    });

    if (delete_id) {
      await this.delete(delete_id);
    }

    return this.toResponse(savedFile);
  }

  /**
   * Ko'p fayl yuklash (task attachments uchun)
   */
  async uploadMany(files: Express.Multer.File[], dto: UploadFileDto = {}): Promise<FileResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Fayllar yuklanmadi');
    }

    const results = await Promise.all(files.map((file) => this.upload(file, dto)));
    return results;
  }

  /**
   * Fayl ma'lumotlarini ID boyicha olish
   */
  async findById(id: string): Promise<FileResponseDto> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`Fayl topilmadi: ${id}`);
    }
    return this.toResponse(file);
  }

  /**
   * Faylni o'chirish:
   * 1. Storage dan o'chiradi
   * 2. DB dan o'chiradi
   */
  async delete(id: string): Promise<{ message: string }> {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`Fayl topilmadi: ${id}`);
    }

    // Storage dan o'chirish
    await this.storageService.delete(file.key);

    // DB dan o'chirish
    await this.fileRepository.delete(id);

    return { message: "Fayl muvaffaqiyatli o'chirildi" };
  }

  /**
   * Faylni active qilish - boshqa entity relation qilganda chaqiriladi
   *
   * Misol: UserService.updateAvatar() ichida:
   *   await this.fileService.activate(newAvatarId);
   *
   * Misol: TaskService.attachFiles() ichida:
   *   await this.fileService.activateMany(fileIds);
   */
  async activate(id: string) {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`Fayl topilmadi: ${id}`);
    }
    return this.fileRepository.activate(id);
  }

  async activateMany(ids: string[]): Promise<void> {
    await this.fileRepository.activateMany(ids);
  }

  /**
   * Cron job: Har kecha soat 02:00 da orphan fayllarni tozalash
   * is_active=false bo'lib 24 soatdan oshgan fayllar o'chiriladi
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanFiles(): Promise<void> {
    this.logger.log('Orphan fayllarni tozalash boshlandi...');

    const orphans = await this.fileRepository.findOrphanFiles(24);

    if (orphans.length === 0) {
      this.logger.log('Orphan fayl topilmadi');
      return;
    }

    // Storage dan o'chirish
    const keys = orphans.map((f) => f.key);
    await this.storageService.deleteMany(keys);

    // DB dan o'chirish
    const ids = orphans.map((f) => f.id);
    await this.fileRepository.deleteMany(ids);

    this.logger.log(`${orphans.length} ta orphan fayl o'chirildi`);
  }

  private toResponse(file: file): FileResponseDto {
    return {
      id: file.id,
      key: file.key,
      url: file.url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      is_active: file.is_active,
      created_at: file.created_at,
    };
  }
}
