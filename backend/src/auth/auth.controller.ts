import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cfg: ConfigService,
  ) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) throw new UnauthorizedException();
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }

  // ── Google OAuth ──────────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Redirects to Google — handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const tokens = await this.authService.googleFindOrCreate(req.user);
    const frontendUrl = this.cfg.get('FRONTEND_URL') || 'http://localhost:3000';
    const redirect = tokens.profileComplete
      ? '/dashboard'
      : '/complete-profile';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}` +
        `&refreshToken=${tokens.refreshToken}&redirect=${redirect}`,
    );
  }
}
