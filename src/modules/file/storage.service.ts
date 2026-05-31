import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = this.config.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.config.getOrThrow<string>('R2_PUBLIC_URL');
    // R2_PUBLIC_URL = https://pub-xxx.r2.dev  yoki custom domain 

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Faylni storage ga yuklaydi
   * @param file - Multer fayl bufferi
   * @param folder - Papka nomi (avatars, tasks, documents, etc.)
   */
  async upload(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    const url = `${this.publicUrl}/${key}`;
    this.logger.log(`File uploaded: ${key}`);

    return { key, url, bucket: this.bucket };
  }

  /**
   * Key orqali faylni storage dan o'chiradi
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Ko'p faylni bir vaqtda o'chirish (orphan cleanup uchun)
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // S3 API max 1000 ta bir vaqtda
    const chunks = this.chunkArray(keys, 1000);
    for (const chunk of chunks) {
      await this.s3.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: chunk.map((key) => ({ Key: key })),
            Quiet: true,
          },
        }),
      );
    }
    this.logger.log(`Deleted ${keys.length} files from storage`);
  }

  /**
   * Private fayllar uchun vaqtinchalik signed URL olish
   */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }
}