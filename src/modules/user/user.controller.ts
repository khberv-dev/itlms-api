import { Controller, Get,Param, HttpCode, HttpStatus, Req, Patch, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import ChangeUserPasswordDto from './dto/change-password.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/me')
    @ApiOperation({ summary: 'Method: get me' })
    @HttpCode(HttpStatus.OK)
    async findOne(@Req() req) {
        return await this.userService.getMe(req.user.id,req.user.role) ;
    }

    @Patch('/password/:id')
    @ApiOperation({ summary: 'Method: change user password' })
     @ApiBody({
        schema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              example: 'hehe',
              description: 'New password for the user',
            },
          },
          required: ['password'],
        },
      })
    @HttpCode(HttpStatus.OK)
    async changePassword(@Param('id') id: string, @Body('password') password: string) {
        return await this.userService.updatePassword(password, id); ;
    }

}
