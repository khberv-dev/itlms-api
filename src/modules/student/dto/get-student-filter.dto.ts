import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class GetStudentFilterDto {
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
    description: `address`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly address: string;

  @ApiProperty({
    description: `job`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly job: string;

  @ApiProperty({
    description: `telegram`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly telegram: string;

  @ApiProperty({
    description: `status`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly status: string;

  @ApiProperty({
    description: `start date`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly start_date: string;

  @ApiProperty({
    description: `end date`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly end_date: string;

  @ApiProperty({
    description: `group id`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly group: string;

  @ApiProperty({
    description: `page`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly page: string;

  @ApiProperty({
    description: `limit`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly limit: string;
}

export default GetStudentFilterDto;
