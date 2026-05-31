import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

class CreateMentorDto {
    @ApiProperty({
        description: `first name`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly first_name: string

    @ApiProperty({
        description: `last name`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly last_name: string

    @ApiProperty({
        description: `phone number`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly phone: string

    @ApiProperty({
        description: `email`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly email: string

    @ApiProperty({
        description: `role`,
        example: 'mentor',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly role: string
}

export default CreateMentorDto