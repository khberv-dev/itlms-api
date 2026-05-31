import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DroppedReason } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateDroppedDto {
  @ApiProperty({ enum: DroppedReason, description: 'To\'xtatish sababi' })
  @IsEnum(DroppedReason)
  reason: DroppedReason;

  @ApiPropertyOptional({ description: 'Qo\'shimcha izoh' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class DroppedListQueryDto {
  @ApiProperty({ example: '2024-03-01', description: 'Boshlanish sanasi' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2024-03-31', description: 'Tugash sanasi' })
  @IsDateString()
  end_date: string;
}