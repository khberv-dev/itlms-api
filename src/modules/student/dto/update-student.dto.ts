import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

class UpdateStudentDto {
    @ApiProperty({
        description: `first name`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly first_name: string

    @ApiProperty({
        description: `last name`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly last_name: string

    @ApiProperty({
        description: `phone number`,
        example: '',
        required: false,
    })
    @IsOptional()
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
        description: `status`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly status: string


    @ApiProperty({
        description: `email`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly email: string

    @ApiProperty({
        description: `profile avatar`,
        example: 'file',
        type: 'string',
        format: 'binary',
        required: false,
    })
    @IsOptional()
    avatar;
}

export default UpdateStudentDto