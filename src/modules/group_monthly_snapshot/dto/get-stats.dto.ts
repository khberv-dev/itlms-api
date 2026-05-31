import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GroupSnapshotStatsQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  group_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mentor_id?: string;
}
