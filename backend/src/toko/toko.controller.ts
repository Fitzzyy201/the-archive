import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Headers,
} from '@nestjs/common';
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

  @Get('status-my-shop')
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
}
