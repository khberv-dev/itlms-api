import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  async upload(file: Express.Multer.File, folder: string = 'uploads'): Promise<UploadResult> {
    const dir = path.join(this.uploadsDir, folder);
    fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    fs.writeFileSync(path.join(this.uploadsDir, key), file.buffer);
    this.logger.log(`File saved: ${key}`);

    return { key, url: `/uploads/${key}`, bucket: 'local' };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadsDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    this.logger.log(`File deleted: ${key}`);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    for (const key of keys) {
      await this.delete(key);
    }
    this.logger.log(`Deleted ${keys.length} files from storage`);
  }
}
