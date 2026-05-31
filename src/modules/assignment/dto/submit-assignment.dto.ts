import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";

class SubmitAssignmentDto {

    @ApiProperty()
    @IsUUID()
    assignment_id: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    @IsArray()
    @IsOptional()
    files: Express.Multer.File[];
}

export default SubmitAssignmentDto;