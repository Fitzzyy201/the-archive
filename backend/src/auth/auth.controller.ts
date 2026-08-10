import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Ini bikin endpoint jalurnya jadi /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Ini bikin endpoint spesifik jadi /auth/register
  async register(@Body() body: any) {
    // Ngambil data dari frontend, terus dilempar ke auth.service.ts
    return this.authService.register(body);
  }
}
