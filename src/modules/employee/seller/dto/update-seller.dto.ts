import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class UpdateSellerDto {
  @ApiProperty({
    description: `first name`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly first_name: string;

  @ApiProperty({
    description: `last name`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly last_name: string;

  @ApiProperty({
    description: `phone number`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly phone: string;

  @ApiProperty({
    description: `birthday`,
    example: '',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  readonly birthday: string;

  @ApiProperty({
    description: `amocrm id`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly amocrm_id: string;

  @ApiProperty({
    description: `sip`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  readonly sip: number;

  @ApiProperty({
    description: `level`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly level: string;

  @ApiProperty({
    description: `work_start_time`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly work_start_time: string;

  @ApiProperty({
    description: `work_end_time`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly work_end_time: string;
}

export default UpdateSellerDto;
