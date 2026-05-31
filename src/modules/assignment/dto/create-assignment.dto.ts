import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  group_id: string;

  @ApiProperty()
  @IsDateString()
  due_date: string;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsArray()
  @IsOptional()
  files: Express.Multer.File[];
}

export default CreateAssignmentDto;
