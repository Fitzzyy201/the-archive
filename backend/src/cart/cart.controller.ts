import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Buyer')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah produk ke keranjang' })
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lihat isi keranjang' })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.sub);
  }

  @Patch(':produkId')
  @ApiOperation({ summary: 'Update kuantitas item keranjang (qty: 0 = hapus)' })
  async updateQty(@Request() req, @Param('produkId') produkId: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateQty(req.user.sub, +produkId, dto);
  }

  @Delete(':produkId')
  @ApiOperation({ summary: 'Hapus item dari keranjang' })
  async removeItem(@Request() req, @Param('produkId') produkId: string) {
    return this.cartService.removeItem(req.user.sub, +produkId);
  }

  @Delete()
  @ApiOperation({ summary: 'Kosongkan keranjang' })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.sub);
  }
}