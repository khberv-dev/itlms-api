import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

class AddStudentsToGroupDto {
    @ApiProperty({
        description: `student_ids`,
        example: ['uuid1', 'uuid2'],
        required: false,
    })
    @IsUUID('all', { each: true })
    @IsArray()
    student_ids: string[];
}

export default AddStudentsToGroupDto