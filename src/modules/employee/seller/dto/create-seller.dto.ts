import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class CreateSellerDto {
  @ApiProperty({
    description: `first name`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly first_name: string;

  @ApiProperty({
    description: `last name`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly last_name: string;

  @ApiProperty({
    description: `phone number`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @ApiProperty({
    description: `level`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly level: string;

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
}

export default CreateSellerDto;
