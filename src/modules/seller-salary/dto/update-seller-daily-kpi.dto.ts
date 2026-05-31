import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

class UpdateSellerDailyKpiDto {
    @ApiProperty({
        description: `started_on_time`,
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    readonly started_on_time: boolean

    @ApiProperty({
        description: `qa_passed`,
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    readonly qa_passed: boolean

    @ApiProperty({
        description: `seller id`,
        example: 3,
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly seller_id: string
}

export default UpdateSellerDailyKpiDto