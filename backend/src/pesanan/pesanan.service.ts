import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RejectOrderDto } from './dto/reject-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { StatusPesanan, StatusKomplain } from '@prisma/client';

@Injectable()
export class PesananService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTokoIdFromUser(userId: number): Promise<number> {
    const toko = await this.prisma.tokoSeller.findFirst({
      where: { userId },
    });

    if (!toko) {
      throw new ForbiddenException('Anda tidak memiliki toko');
    }

    return toko.id;
  }

  private async createOrderHistory(
    transaksiId: number,
    statusSebelum: StatusPesanan,
    statusSesudah: StatusPesanan,
    dibuatOleh: number,
    catatan?: string,
  ) {
    await this.prisma.orderHistory.create({
      data: {
        transaksiId,
        statusSebelum,
        statusSesudah,
        dibuatOleh,
        catatan,
      },
    });
  }

  async getOrdersByToko(
    tokoId: number,
    query: OrderQueryDto,
  ) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { tokoId };
    if (status) {
      where.statusPesanan = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.transaksi.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              nama: true,
              email: true,
              noTelp: true,
            },
          },
          detail: {
            include: {
              produk: {
                select: {
                  id: true,
                  namaProduk: true,
                  fotoProduk: true,
                  harga: true,
                },
              },
            },
          },
          shippingResi: true,
          komplain: {
            select: {
              id: true,
              statusKomplain: true,
              alasanKomplain: true,
            },
          },
        },
        orderBy: { waktuTransaksi: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaksi.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getIncomingOrders(tokoId: number, query: OrderQueryDto) {
    return this.getOrdersByToko(tokoId, {
      ...query,
      status: StatusPesanan.PENDING,
    });
  }

  async getOrdersToShip(tokoId: number, query: OrderQueryDto) {
    return this.getOrdersByToko(tokoId, {
      ...query,
      status: StatusPesanan.DIPROSES,
    });
  }

  async getOrderHistory(tokoId: number, query: OrderQueryDto) {
    return this.getOrdersByToko(tokoId, {
      ...query,
      status: StatusPesanan.SELESAI,
    });
  }

  async getOrderDetail(transaksiId: number, tokoId: number) {
    const order = await this.prisma.transaksi.findFirst({
      where: {
        id: transaksiId,
        tokoId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            nama: true,
            email: true,
            noTelp: true,
          },
        },
        detail: {
          include: {
            produk: {
              select: {
                id: true,
                namaProduk: true,
                fotoProduk: true,
                harga: true,
                ukuranDimensi: true,
              },
            },
          },
        },
        shippingResi: true,
        komplain: {
          include: {
            admin: {
              select: { nama: true },
            },
          },
        },
        history: {
          orderBy: { waktuUbah: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    return order;
  }

  async acceptOrder(transaksiId: number, tokoId: number, userId: number) {
    const order = await this.prisma.transaksi.findFirst({
      where: { id: transaksiId, tokoId },
      include: { detail: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.statusPesanan !== StatusPesanan.PENDING) {
      throw new BadRequestException(
        `Pesanan tidak bisa diterima karena status saat ini: ${order.statusPesanan}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.transaksi.update({
        where: { id: transaksiId },
        data: {
          statusPesanan: StatusPesanan.DIPROSES,
          batasWaktuKomplain: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2x24 jam
        },
      });

      await this.createOrderHistory(
        transaksiId,
        StatusPesanan.PENDING,
        StatusPesanan.DIPROSES,
        userId,
        'Pesanan diterima oleh seller',
      );

      return updatedOrder;
    });

    return {
      message: 'Pesanan berhasil diterima, status berubah menjadi DIPROSES',
      order: updated,
    };
  }

  async acceptAllOrders(tokoId: number, userId: number) {
    const pendingOrders = await this.prisma.transaksi.findMany({
      where: {
        tokoId,
        statusPesanan: StatusPesanan.PENDING,
      },
      select: { id: true },
    });

    if (pendingOrders.length === 0) {
      return { message: 'Tidak ada pesanan masuk yang perlu diterima', count: 0 };
    }

    const transaksiIds = pendingOrders.map((o) => o.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.transaksi.updateMany({
        where: { id: { in: transaksiIds } },
        data: {
          statusPesanan: StatusPesanan.DIPROSES,
          batasWaktuKomplain: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      for (const id of transaksiIds) {
        await tx.orderHistory.create({
          data: {
            transaksiId: id,
            statusSebelum: StatusPesanan.PENDING,
            statusSesudah: StatusPesanan.DIPROSES,
            dibuatOleh: userId,
            catatan: 'Pesanan diterima oleh seller (Accept All)',
          },
        });
      }
    });

    return {
      message: `${pendingOrders.length} pesanan berhasil diterima sekaligus`,
      count: pendingOrders.length,
    };
  }

  async rejectOrder(
    transaksiId: number,
    tokoId: number,
    userId: number,
    dto: RejectOrderDto,
  ) {
    const order = await this.prisma.transaksi.findFirst({
      where: { id: transaksiId, tokoId },
      include: { detail: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.statusPesanan !== StatusPesanan.PENDING) {
      throw new BadRequestException(
        `Pesanan tidak bisa ditolak karena status saat ini: ${order.statusPesanan}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.transaksi.update({
        where: { id: transaksiId },
        data: {
          statusPesanan: StatusPesanan.DITOLAK,
          alasanReject: dto.alasanPenolakan,
        },
      });

      await this.createOrderHistory(
        transaksiId,
        StatusPesanan.PENDING,
        StatusPesanan.DITOLAK,
        userId,
        `Pesanan ditolak: ${dto.alasanPenolakan}`,
      );

      // Kembalikan stok produk
      for (const detail of order.detail) {
        await tx.produk.update({
          where: { id: detail.produkId },
          data: { stok: { increment: detail.qty } },
        });
      }

      return updatedOrder;
    });

    return {
      message: 'Pesanan berhasil ditolak',
      order: updated,
    };
  }

  async shipOrder(
    transaksiId: number,
    tokoId: number,
    userId: number,
    dto: ShipOrderDto,
  ) {
    const order = await this.prisma.transaksi.findFirst({
      where: { id: transaksiId, tokoId },
      include: { shippingResi: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.statusPesanan !== StatusPesanan.DIPROSES) {
      throw new BadRequestException(
        `Pesanan tidak bisa dikirim karena status saat ini: ${order.statusPesanan}`,
      );
    }

    if (order.shippingResi) {
      throw new BadRequestException('Pesanan sudah memiliki nomor resi');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.shippingResi.create({
        data: {
          transaksiId,
          nomorResi: dto.nomorResi,
          ekspedisi: dto.ekspedisi,
          buktiResi: dto.buktiResi,
        },
      });

      const updatedOrder = await tx.transaksi.update({
        where: { id: transaksiId },
        data: {
          statusPesanan: StatusPesanan.DIKIRIM,
          resi: dto.nomorResi,
          batasWaktuKomplain: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      await this.createOrderHistory(
        transaksiId,
        StatusPesanan.DIPROSES,
        StatusPesanan.DIKIRIM,
        userId,
        `Pengiriman via ${dto.ekspedisi} (Resi: ${dto.nomorResi})`,
      );

      return updatedOrder;
    });

    return {
      message: 'Pengiriman berhasil dikonfirmasi, status berubah menjadi DIKIRIM',
      order: updated,
    };
  }

  async cancelOrder(transaksiId: number, tokoId: number, userId: number) {
    const order = await this.prisma.transaksi.findFirst({
      where: { id: transaksiId, tokoId },
      include: { detail: true },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.statusPesanan !== StatusPesanan.DIPROSES) {
      throw new BadRequestException(
        `Pesanan tidak bisa dibatalkan karena status saat ini: ${order.statusPesanan}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.transaksi.update({
        where: { id: transaksiId },
        data: { statusPesanan: StatusPesanan.DIBATALKAN },
      });

      await this.createOrderHistory(
        transaksiId,
        StatusPesanan.DIPROSES,
        StatusPesanan.DIBATALKAN,
        userId,
        'Pesanan dibatalkan oleh seller',
      );

      for (const detail of order.detail) {
        await tx.produk.update({
          where: { id: detail.produkId },
          data: { stok: { increment: detail.qty } },
        });
      }

      return updatedOrder;
    });

    return {
      message: 'Pesanan berhasil dibatalkan, stok produk dikembalikan',
      order: updated,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteOrders() {
    const now = new Date();

    const ordersToComplete = await this.prisma.transaksi.findMany({
      where: {
        statusPesanan: StatusPesanan.DIKIRIM,
        batasWaktuKomplain: { lte: now },
      },
      select: { id: true },
    });

    if (ordersToComplete.length === 0) {
      return { message: 'Tidak ada pesanan yang perlu diselesaikan otomatis', count: 0 };
    }

    const transaksiIds = ordersToComplete.map((o) => o.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.transaksi.updateMany({
        where: { id: { in: transaksiIds } },
        data: { statusPesanan: StatusPesanan.SELESAI },
      });

      for (const id of transaksiIds) {
        await tx.orderHistory.create({
          data: {
            transaksiId: id,
            statusSebelum: StatusPesanan.DIKIRIM,
            statusSesudah: StatusPesanan.SELESAI,
            dibuatOleh: 0, // System user
            catatan: 'Otomatis diselesaikan setelah 2x24 jam sejak dikirim',
          },
        });
      }
    });

    return {
      message: `${ordersToComplete.length} pesanan otomatis diselesaikan`,
      count: ordersToComplete.length,
    };
  }
}