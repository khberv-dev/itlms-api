import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

class CreateReSaleDto {
    @ApiProperty({
        description: `month`,
        example: 3,
    })
    @IsNotEmpty()
    @Type(() => Number)
    readonly month: number

    @ApiProperty({
        description: `sum`,
        example: 700000,
    })
    @IsNotEmpty()
    @Type(() => Number)
    readonly sum: number

    @ApiProperty({
        description: `student id`,
        example: 'uuid',
    })
    @IsNotEmpty()
    @IsString()
    readonly student_id: string

    @ApiProperty({
        description: `payment type`,
        example: '',
    })
    @IsNotEmpty()
    @IsString()
    readonly payment_type: string

    @ApiProperty({
        description: `date`,
        example: '',
    })
    @IsNotEmpty()
    @Type(() => Date)
    readonly date: string

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

export default CreateReSaleDto