import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Buyer')
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Checkout keranjang - membuat transaksi dan Midtrans token' })
  async checkout(@Request() req, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(req.user.sub, dto);
  }

  @Get(':id/token')
  @ApiOperation({ summary: 'Dapatkan ulang Midtrans token untuk transaksi' })
  async getToken(@Request() req, @Param('id') id: string) {
    // Bisa diimplementasikan jika perlu regenerate token
    return { message: 'Gunakan token dari response checkout awal' };
  }
}