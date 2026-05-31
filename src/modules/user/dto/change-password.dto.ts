import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class ChangeUserPasswordDto {
  @ApiProperty({
    description: `new_password`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly new_password: string;

  @ApiProperty({
    description: `old_password`,
    example: '',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly old_password: string;
}

export default ChangeUserPasswordDto;
