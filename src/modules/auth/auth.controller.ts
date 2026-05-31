import {
  Req,
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  HttpCode,
} from '@nestjs/common';
import express from 'express';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './passport-strategies/local/local-auth.guard';
import { RefreshTokenUserGuard } from './passport-strategies/refresh-token-user/refresh-token-user.guard';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async login(
    @Req() { user }: { user },
    @Res({ passthrough: true }) response: express.Response,
    @Body() _: LoginDto,
  ) {
    const accessToken = this.authService.getJWT('access', user.id, user.role);
    const refreshToken = this.authService.getJWT('refresh', user.id, user.role);
    return { accessToken, refreshToken, user };
  }

  @Public()
  @UseGuards(RefreshTokenUserGuard)
  @Post('/refresh')
  @HttpCode(200)
  @ApiNoContentResponse({
    description: 'New access, refresh tokens have been saved.',
  })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  async refresh(
    @Req() { user }: { user },
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const accessToken = this.authService.getJWT('access', user.id, user.role);
    const refreshToken = this.authService.getJWT('refresh', user.id, user.role);
    return { accessToken, refreshToken };
  }
}
