import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class UpdateMentorDto {
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
    description: `email`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly email: string;

  @ApiProperty({
    description: `role`,
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly role: string;
}

export default UpdateMentorDto;
