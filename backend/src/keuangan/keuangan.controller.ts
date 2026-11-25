import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { KeuanganService } from './keuangan.service';
import { TarikDanaDto } from './dto/tarik-dana.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TokoVerifiedGuard } from '../auth/guards/toko-verified.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Keuangan Seller')
@Controller('keuangan')
@UseGuards(JwtAuthGuard, RolesGuard, TokoVerifiedGuard)
@Roles('Seller')
@ApiBearerAuth()
export class KeuanganController {
  constructor(private readonly keuanganService: KeuanganService) {}

  @Get('toko/:tokoId')
  async getKeuangan(@Request() req, @Param('tokoId') tokoId: string) {
    return this.keuanganService.getKeuanganByToko(+tokoId);
  }

  @Post('tarik-dana')
  async tarikDana(@Request() req, @Body() dto: TarikDanaDto) {
    return this.keuanganService.tarikDana(req.tokoId, req.user.sub, dto);
  }
}
