import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';

@Controller('toko')
export class TokoController {
  constructor(private readonly tokoService: TokoService) {}

  @Post('register-seller')
  async registerSeller(@Body() dto: CreateTokoDto) {
    return this.tokoService.registerSeller(dto);
  }

  @Patch('verifikasi/:id')
  async verifikasiToko(
    @Param('id') id: string,
    @Body() body: { status: 'Approved' | 'Rejected'; alasanPenolakan?: string },
  ) {
    return this.tokoService.verifikasiToko(
      +id,
      body.status,
      body.alasanPenolakan,
    );
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.tokoService.getProfile(+userId);
  }

  @Patch('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() dto: { namaToko?: string; kota?: string; noTelp?: string; fotoProfil?: string },
  ) {
    return this.tokoService.updateProfile(+userId, dto);
  }
}