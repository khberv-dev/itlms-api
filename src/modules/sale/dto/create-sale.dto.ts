import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

class CreateSaleDto {
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
        description: `telegram`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly telegram: string

    @ApiProperty({
        description: `source`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly source: string

    @ApiProperty({
        description: `comment`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    readonly comment: string

    @ApiProperty({
        description: `payment_type`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly payment_type: string

    @ApiProperty({
        description: `month`,
        example: 3,
        required: false,
    })
    @IsNotEmpty()
   @Type(() => Number)
    readonly month: number

    @ApiProperty({
        description: `sum`,
        example: 700000,
        required: false,
    })
    @IsNotEmpty()
    @Type(() => Number)
    readonly sum: number

    @ApiProperty({
        description: `date`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @Type(() => Date)
    readonly date: string

    @ApiProperty({
        description: `address`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly address: string

    @ApiProperty({
        description: `job`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly job: string

    @ApiProperty({
        description: `gender`,
        example: 'male',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly gender: string

    @ApiProperty({
        description: `file`,
        example: 'file',
        type: 'string',
        format: 'binary',
        required: false,
    })
    @IsOptional()
    file;

    @ApiProperty({
        description: `file_id`,
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString()
    file_id: string
}

export default CreateSaleDto