import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class SnapshotRangeQueryDto {
  @ApiProperty({ example: '2024-01-01', description: 'Boshlanish sanasi' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2024-03-31', description: 'Tugash sanasi' })
  @IsDateString()
  end_date: string;
}

export class GroupSnapshotQueryDto extends SnapshotRangeQueryDto {
  @ApiPropertyOptional({ description: 'Guruh ID (berilmasa barcha guruhlar)' })
  @IsOptional()
  @IsUUID()
  group_id?: string;
}

export class MentorSnapshotQueryDto extends SnapshotRangeQueryDto {
  @ApiPropertyOptional({
    description: 'Mentor ID (berilmasa barcha mentorlar)',
  })
  @IsOptional()
  @IsUUID()
  mentor_id?: string;
}
