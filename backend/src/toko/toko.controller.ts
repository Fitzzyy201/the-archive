import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Get('status-my-shop')
  @UseGuards(JwtAuthGuard)
  async getMyShopStatus(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusVerif: null };
    }

    try {
      const token = authHeader.split(' ')[1];

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(
        Buffer.from(payloadBase64, 'base64').toString('utf-8'),
      ) as { id?: number; sub?: number };

      const userId = Number(decodedPayload.id ?? decodedPayload.sub);

      return this.tokoService.getMyShopStatus(userId);
    } catch (error) {
      console.error('Gagal baca token:', error);
      return { statusVerif: null };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTokoDetail(@Param('id') id: string) {
    return this.tokoService.getTokoDetail(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Seller')
  async updateTokoDetail(
    @Param('id') id: string,
    @Body()
    body: {
      namaToko?: string;
      noToko?: string;
      kota?: string;
      email?: string;
      fotoToko?: string;
    },
  ) {
    return this.tokoService.updateTokoDetail(+id, body);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Seller')
  async getTokoByUserId(@Param('userId') userId: string) {
    return this.tokoService.getTokoByUserId(+userId);
  }
}
