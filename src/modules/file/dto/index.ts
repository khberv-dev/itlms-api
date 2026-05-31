import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Fayl yuklanganda is_active ni true qilish (default: false)',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Fayl saqlash papkasi (default: "uploads")',
    example: 'avatars',
  })
  @IsOptional()
  folder?: string;
}

export class FileResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id: string;

  @ApiProperty({ example: 'avatars/1234567890-photo.jpg' })
  key: string;

  @ApiProperty({ example: 'https://pub-xxx.r2.dev/avatars/1234567890-photo.jpg' })
  url: string;

  @ApiProperty({ example: 'photo.jpg' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ example: 204800 })
  size: number;

  @ApiProperty({ example: false })
  is_active: boolean;

  @ApiProperty()
  created_at: Date;
}

export class ActivateFileDto {
  @ApiProperty({ description: 'File ID larini active qilish', type: [String] })
  file_ids: string[];
}