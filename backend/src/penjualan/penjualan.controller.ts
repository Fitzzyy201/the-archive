import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PenjualanService } from './penjualan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TokoVerifiedGuard } from '../auth/guards/toko-verified.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Penjualan Seller')
@Controller('penjualan')
@UseGuards(JwtAuthGuard, RolesGuard, TokoVerifiedGuard)
@Roles('Seller')
@ApiBearerAuth()
export class PenjualanController {
  constructor(private readonly penjualanService: PenjualanService) {}

  @Get('toko/:tokoId')
  async getRingkasan(
    @Request() req,
    @Param('tokoId') tokoId: string,
    @Query('periode') periode?: string,
    @Query('dari') dari?: string,
    @Query('sampai') sampai?: string,
  ) {
    return this.penjualanService.getRingkasan(
      req.tokoId || +tokoId,
      periode,
      dari,
      sampai,
    );
  }
}
