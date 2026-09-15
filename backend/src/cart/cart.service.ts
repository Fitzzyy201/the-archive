import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const produk = await this.prisma.produk.findUnique({
      where: { id: dto.produkId },
      include: { toko: true },
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (produk.statusProduk !== 'Aktif') {
      throw new BadRequestException('Produk tidak aktif');
    }

    if (produk.stok < dto.qty) {
      throw new BadRequestException(`Stok tidak mencukupi. Tersedia: ${produk.stok}`);
    }

    const existingCart = await this.prisma.cart.findFirst({
      where: {
        userId,
        produkId: dto.produkId,
      },
    });

    let cartItem;
    if (existingCart) {
      const newQty = existingCart.qty + dto.qty;
      if (produk.stok < newQty) {
        throw new BadRequestException(`Stok tidak mencukupi. Tersedia: ${produk.stok}`);
      }
      cartItem = await this.prisma.cart.update({
        where: { id: existingCart.id },
        data: { qty: newQty },
      });
    } else {
      cartItem = await this.prisma.cart.create({
        data: {
          userId,
          produkId: dto.produkId,
          qty: dto.qty,
        },
      });
    }

    return this.getCartItemWithDetails(cartItem.id);
  }

  async getCart(userId: number) {
    const items = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        produk: {
          include: {
            toko: {
              select: {
                id: true,
                namaToko: true,
                kota: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const itemsWithSubtotal = items.map((item) => ({
      ...item,
      subtotal: item.produk.harga * item.qty,
    }));

    const totalHarga = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = itemsWithSubtotal.reduce((sum, item) => sum + item.qty, 0);

    // Group by toko
    const groupedByToko = itemsWithSubtotal.reduce((acc, item) => {
      const tokoId = item.produk.toko.id;
      if (!acc[tokoId]) {
        acc[tokoId] = {
          toko: item.produk.toko,
          items: [],
          subtotal: 0,
          totalItems: 0,
        };
      }
      acc[tokoId].items.push(item);
      acc[tokoId].subtotal += item.subtotal;
      acc[tokoId].totalItems += item.qty;
      return acc;
    }, {} as Record<number, any>);

    return {
      items: itemsWithSubtotal,
      groupedByToko: Object.values(groupedByToko),
      summary: {
        totalHarga,
        totalItems,
        totalToko: Object.keys(groupedByToko).length,
      },
    };
  }

  async updateQty(userId: number, produkId: number, dto: UpdateCartDto) {
    const cartItem = await this.prisma.cart.findFirst({
      where: { userId, produkId },
      include: { produk: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Item keranjang tidak ditemukan');
    }

    if (dto.qty === 0) {
      await this.prisma.cart.delete({
        where: { id: cartItem.id },
      });
      return { message: 'Item dihapus dari keranjang' };
    }

    if (cartItem.produk.stok < dto.qty) {
      throw new BadRequestException(`Stok tidak mencukupi. Tersedia: ${cartItem.produk.stok}`);
    }

    const updated = await this.prisma.cart.update({
      where: { id: cartItem.id },
      data: { qty: dto.qty },
    });

    return this.getCartItemWithDetails(updated.id);
  }

  async removeItem(userId: number, produkId: number) {
    const cartItem = await this.prisma.cart.findFirst({
      where: { userId, produkId },
    });

    if (!cartItem) {
      throw new NotFoundException('Item keranjang tidak ditemukan');
    }

    await this.prisma.cart.delete({
      where: { id: cartItem.id },
    });

    return { message: 'Item dihapus dari keranjang' };
  }

  async clearCart(userId: number) {
    await this.prisma.cart.deleteMany({
      where: { userId },
    });
    return { message: 'Keranjang dikosongkan' };
  }

  async validateCartStock(userId: number): Promise<{ valid: boolean; errors: string[] }> {
    const items = await this.prisma.cart.findMany({
      where: { userId },
      include: { produk: true },
    });

    const errors: string[] = [];
    for (const item of items) {
      if (item.produk.statusProduk !== 'Aktif') {
        errors.push(`${item.produk.namaProduk}: Produk tidak aktif`);
      }
      if (item.produk.stok < item.qty) {
        errors.push(`${item.produk.namaProduk}: Stok tidak mencukupi (tersedia ${item.produk.stok}, diminta ${item.qty})`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async calculateTotal(userId: number) {
    const items = await this.prisma.cart.findMany({
      where: { userId },
      include: { produk: true },
    });

    let totalHarga = 0;
    let totalItems = 0;
    for (const item of items) {
      totalHarga += item.produk.harga * item.qty;
      totalItems += item.qty;
    }

    return { totalHarga, totalItems };
  }

  private async getCartItemWithDetails(cartId: number) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        produk: {
          include: {
            toko: {
              select: {
                id: true,
                namaToko: true,
                kota: true,
              },
            },
          },
        },
      },
    });
  }
}