import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsUUID } from 'class-validator';

class AttendanceItemDto {
  @ApiProperty()
  @IsUUID()
  student_id: string;

  @ApiProperty()
  @IsBoolean()
  is_present: boolean;
}

export class CreateAttendanceDto {
  @ApiProperty()
  @IsUUID()
  group_id: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ type: [AttendanceItemDto] })
  @IsArray()
  attendance: AttendanceItemDto[];
}

export default CreateAttendanceDto;
