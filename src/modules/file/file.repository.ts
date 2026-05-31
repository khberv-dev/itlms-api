import { Injectable } from '@nestjs/common';
import { PrismaService } from '../_prisma/prisma.service';
import { file } from '@prisma/client';

export interface CreateFileData {
    key: string;
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    bucket: string;
    is_active?: boolean;
}

@Injectable()
export class FileRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateFileData): Promise<file> {
        return this.prisma.file.create({ data });
    }

    async findById(id: string): Promise<file | null> {
        return this.prisma.file.findUnique({ where: { id } });
    }

    async findByKey(key: string): Promise<file | null> {
        return this.prisma.file.findUnique({ where: { key } });
    }

    async findManyByIds(ids: string[]): Promise<file[]> {
        return this.prisma.file.findMany({ where: { id: { in: ids } } });
    }

    /**
     * Faylni active qilish - boshqa entity bilan relation bo'lganda chaqiriladi
     */
    async activate(id: string): Promise<file> {
        return  this.prisma.file.update({
            where: { id },
            data: { is_active: true },
        });
    }

    /**
     * Ko'p faylni bir vaqtda active qilish
     */
    async activateMany(ids: string[]): Promise<void> {
        await this.prisma.file.updateMany({
            where: { id: { in: ids } },
            data: { is_active: true },
        });
    }

    async delete(id: string): Promise<file> {
        return this.prisma.file.delete({ where: { id } });
    }

    /**
     * Orphan fayllarni topish:
     * is_active=false bo'lib, ma'lum vaqtdan oshib ketgan fayllar
     */
    async findOrphanFiles(olderThanHours: number = 24): Promise<file[]> {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

        return this.prisma.file.findMany({
            where: {
                is_active: false,
                created_at: { lt: cutoffDate },
            },
        });
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.prisma.file.deleteMany({
            where: { id: { in: ids } },
        });
    }
}