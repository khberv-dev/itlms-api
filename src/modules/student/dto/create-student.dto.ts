import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

class CreateStudentDto {
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
        description: `address`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly address: string

    @ApiProperty({
        description: `job`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly job: string

    @ApiProperty({
        description: `telegram`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly telegram: string

    @ApiProperty({
        description: `password`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly password: string
}

export default CreateStudentDto