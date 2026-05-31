import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateAdministrationDto {
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
    description: `role`,
    example: 'mentor',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly role: string;
}

export default CreateAdministrationDto;
