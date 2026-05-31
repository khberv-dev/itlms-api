import { ApiProperty } from "@nestjs/swagger"
import { GroupStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"

class CreateGroupDto {
    @ApiProperty({
        description: `name`,
        example: '',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly name: string

    @ApiProperty({
        description: `status`,
        example: GroupStatus.collecting,
        required: false,
    })
    @IsEnum(GroupStatus)
    @IsOptional()
    status?: GroupStatus = GroupStatus.collecting;

    @ApiProperty({
        description: `level_id`,
        example: '',
        required: false,
    })
    @IsUUID()
    @IsNotEmpty()
    level_id?: string;

    @ApiProperty({
        description: `mentor_id`,
        example: '',
        required: false,
    })
    @IsString()
    @IsOptional()
    mentor_id?: string;

    @ApiProperty({
        description: `assistant_id`,
        example: '',
        required: false,
    })
    @IsString()
    @IsOptional()
    assistant_id?: string;
}

export default CreateGroupDto
