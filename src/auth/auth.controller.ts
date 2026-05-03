import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from '@auth/auth.service';
import { SignInDto } from '@auth/dto/sign-in.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@decorator/public.decorator';
import type { Request as RequestDto } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiBearerAuth()
  @Get('me')
  getProfile(@Request() req: RequestDto) {
    return req.user;
  }
}
