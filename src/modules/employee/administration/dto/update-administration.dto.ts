import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

class UpdateAdministrationDto {
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
}

export default UpdateAdministrationDto