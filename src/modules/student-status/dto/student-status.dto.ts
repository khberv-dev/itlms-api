import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class ChangeStudentStatusDto {
  @ApiProperty({ enum: StudentStatus, description: 'Yangi status' })
  @IsEnum(StudentStatus)
  to_status: StudentStatus;

  @ApiPropertyOptional({ description: 'Izoh' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class StudentStatusQueryDto {
  @ApiPropertyOptional({ description: 'Student ID' })
  @IsOptional()
  @IsUUID()
  student_id?: string;
}
