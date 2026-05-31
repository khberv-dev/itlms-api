import { ApiProperty } from '@nestjs/swagger';
import { GroupStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

class GetGroupFilterDto {
  @ApiProperty({
    description: `title`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: `status`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupStatus)
  status?: GroupStatus;

  @ApiProperty({
    description: `level_id`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  level_id?: string;

  @ApiProperty({
    description: `mentor_id`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  mentor_id?: string;

  @ApiProperty({
    description: `assistant_id`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assistant_id?: string;

  @ApiProperty({
    description: `start_date`,
    example: '',
    required: false,
  })
  @IsOptional()
  start_date?: string; // ISO string yoki Date

  @ApiProperty({
    description: `end_date`,
    example: '',
    required: false,
  })
  @IsOptional()
  end_date?: string;
}

export default GetGroupFilterDto;
