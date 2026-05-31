import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { UploadFileDto, FileResponseDto } from './dto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * POST /files/upload
   * Bitta fayl yuklash
   */
  @Post('upload')
  @ApiOperation({ summary: 'Bitta fayl yuklash' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'avatars', description: 'Storage papkasi' },
        is_active: { type: 'boolean', description: 'Darhol active qilish' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ): Promise<FileResponseDto> {
    return this.fileService.upload(file, dto);
  }

  /**
   * POST /files/upload-many
   * Ko'p fayl yuklash (task attachments uchun)
   */
  @Post('upload-many')
  @ApiOperation({ summary: 'Ko\'p fayl yuklash (max 10 ta)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        folder: { type: 'string', example: 'task-attachments' },
        is_active: { type: 'boolean' },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFileDto,
  ): Promise<FileResponseDto[]> {
    return this.fileService.uploadMany(files, dto);
  }

  /**
   * GET /files/:id
   * Fayl ma'lumotlarini olish
   */
  @Get(':id')
  @ApiOperation({ summary: 'Fayl ma\'lumotlarini ID boyicha olish' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async getFile(@Param('id') id: string): Promise<FileResponseDto> {
    return this.fileService.findById(id);
  }

  /**
   * DELETE /files/:id
   * Faylni storage va DB dan o'chirish
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Faylni o\'chirish (storage + DB)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    return this.fileService.delete(id);
  }
}