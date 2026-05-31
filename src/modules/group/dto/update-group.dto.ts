import { PartialType } from "@nestjs/swagger";
import { CreateGroupDto } from ".";

class UpdateGroupDto extends PartialType(CreateGroupDto) { }

export default UpdateGroupDto