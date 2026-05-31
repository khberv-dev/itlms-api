import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrozenReason } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateFrozenDto {
  @ApiProperty({ enum: FrozenReason, description: 'Muzlatish sababi' })
  @IsEnum(FrozenReason)
  reason: FrozenReason;

  @ApiProperty({
    example: '2024-04-01',
    description: 'Muzlatish tugash sanasi',
  })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ description: 'Qo\'shimcha izoh' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class FrozenListQueryDto {
  @ApiProperty({
    example: '2024-03-01',
    description: 'Boshlanish sanasi (filter)',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2024-03-31',
    description: 'Tugash sanasi (filter)',
  })
  @IsDateString()
  end_date: string;
}