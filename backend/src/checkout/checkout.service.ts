import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';
import { CheckoutDto } from './dto/checkout.dto';
import { StatusPesanan } from '@prisma/client';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async checkout(userId: number, dto: CheckoutDto) {
    // Validasi alamat
    const alamat = await this.prisma.alamatPengiriman.findFirst({
      where: { id: dto.alamatId, userId },
    });

    if (!alamat) {
      throw new NotFoundException('Alamat pengiriman tidak ditemukan');
    }

    // Validasi stok keranjang
    const stockValidation = await this.cartService.validateCartStock(userId);
    if (!stockValidation.valid) {
      throw new BadRequestException({
        message: 'Validasi stok gagal',
        errors: stockValidation.errors,
      });
    }

    // Ambil item keranjang
    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Keranjang kosong');
    }

    // Hitung total
    const { totalHarga } = await this.cartService.calculateTotal(userId);

    // Group by toko untuk membuat transaksi per toko
    const groupedByToko = cart.groupedByToko;

    const results: Array<{
      transaksiId: number;
      midtransToken: string;
      redirectUrl: string;
      expiredAt: Date;
      totalHarga: number;
    }> = [];

    for (const group of groupedByToko) {
      const result = await this.createTransaksiPerToko(
        userId,
        group.toko.id,
        group.items,
        group.subtotal,
        alamat,
        dto.catatan,
      );
      results.push(result);
    }

    // Kosongkan keranjang
    await this.cartService.clearCart(userId);

    // Return transaksi pertama (untuk single toko) atau semua
    return {
      message: 'Checkout berhasil',
      transaksi: results,
    };
  }

  private async createTransaksiPerToko(
    buyerId: number,
    tokoId: number,
    items: any[],
    totalHarga: number,
    alamat: any,
    catatan?: string,
  ) {
    const midtransOrderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    return this.prisma.$transaction(async (tx) => {
      // Kurangi stok produk
      for (const item of items) {
        await tx.produk.update({
          where: { id: item.produk.id },
          data: { stok: { decrement: item.qty } },
        });
      }

      // Buat transaksi
      const transaksi = await tx.transaksi.create({
        data: {
          buyerId,
          tokoId,
          totalHarga,
          statusPesanan: 'PENDING',
          midtransOrderId,
          expiredAt,
          batasWaktuTransaksi: expiredAt,
          detail: {
            create: items.map((item) => ({
              produkId: item.produk.id,
              qty: item.qty,
              hargaSatuan: item.produk.harga,
              subtotal: item.produk.harga * item.qty,
            })),
          },
        },
        include: {
          detail: { include: { produk: true } },
          buyer: true,
          toko: { include: { user: true } },
        },
      });

      // Buat history
      await tx.orderHistory.create({
        data: {
          transaksiId: transaksi.id,
          statusSebelum: 'PENDING',
          statusSesudah: 'PENDING',
          dibuatOleh: buyerId,
          catatan: 'Pesanan dibuat, menunggu pembayaran',
        },
      });

      // Buat Midtrans transaction
      const buyer = transaksi.buyer;
      const itemDetails = items.map((item) => ({
        id: item.produk.id.toString(),
        price: item.produk.harga,
        quantity: item.qty,
        name: item.produk.namaProduk,
      }));

      const frontendUrl = this.getFrontendUrl();
      const midtransResponse = await this.paymentService.createSnapTransaction({
        orderId: midtransOrderId,
        grossAmount: totalHarga,
        customerDetails: {
          firstName: buyer.nama || buyer.email,
          email: buyer.email,
          phone: buyer.noTelp,
        },
        itemDetails,
        callbacks: {
          finish: `${frontendUrl}/checkout/finish`,
          error: `${frontendUrl}/checkout/error`,
          pending: `${frontendUrl}/checkout/pending`,
        },
        expiry: {
          unit: 'minute',
          duration: 15,
        },
      });

      // Update transaksi dengan midtrans token
      await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          midtransToken: midtransResponse.token,
        },
      });

      // Kirim notifikasi ke buyer
      await this.notificationService.create({
        userId: buyerId,
        tipe: 'ORDER_CREATED',
        title: 'Pesanan Dibuat',
        message: `Pesanan #${transaksi.id} berhasil dibuat. Silakan lakukan pembayaran dalam 15 menit.`,
        link: `/checkout/${transaksi.id}`,
      });

      return {
        transaksiId: transaksi.id,
        midtransToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
        expiredAt,
        totalHarga,
      };
    });
  }

  async handleMidtransWebhook(notification: any) {
    const parsed = this.paymentService.parseNotification(notification);

    if (!this.paymentService.verifyWebhookSignature(notification)) {
      throw new BadRequestException('Signature tidak valid');
    }

    const transaksi = await this.prisma.transaksi.findUnique({
      where: { midtransOrderId: parsed.orderId },
      include: {
        buyer: true,
        toko: { include: { user: true } },
        detail: { include: { produk: true } },
      },
    });

    if (!transaksi) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    const newStatus = this.paymentService.mapStatusToOrderStatus(parsed.status);
    const isSuccess = this.paymentService.isSuccessfulPayment(parsed.status);
    const isFailed = this.paymentService.isFailedPayment(parsed.status);

    if (transaksi.statusPesanan === newStatus) {
      return { message: 'Status sudah sama', transaksiId: transaksi.id };
    }

    await this.prisma.$transaction(async (tx) => {
      // Update transaksi
      await tx.transaksi.update({
        where: { id: transaksi.id },
        data: {
          statusPesanan: newStatus as StatusPesanan,
          midtransStatus: parsed.status,
          paymentType: parsed.paymentType,
          vaNumber: parsed.vaNumber,
          settledAt: parsed.settlementTime,
        },
      });

      // Buat history
      await tx.orderHistory.create({
        data: {
          transaksiId: transaksi.id,
          statusSebelum: transaksi.statusPesanan,
          statusSesudah: newStatus as StatusPesanan,
          dibuatOleh: 0, // System
          catatan: `Midtrans webhook: ${parsed.status}`,
        },
      });

      // Handle status changes
      if (isSuccess) {
        // Pembayaran berhasil - notifikasi ke seller & buyer
        await this.sendPaymentSuccessNotifications(transaksi, tx);
      } else if (isFailed) {
        // Pembayaran gagal/expired - kembalikan stok
        await this.restoreStockAndCancel(transaksi, tx);
        await this.sendPaymentFailedNotifications(transaksi, tx);
      }
    });

    return { message: 'Webhook processed', transaksiId: transaksi.id };
  }

  private async sendPaymentSuccessNotifications(transaksi: any, tx: any) {
    // Notifikasi ke buyer
    await this.notificationService.create({
      userId: transaksi.buyerId,
      tipe: 'ORDER_PAID',
      title: 'Pembayaran Berhasil',
      message: `Pembayaran untuk pesanan #${transaksi.id} berhasil. Menunggu konfirmasi seller.`,
      link: `/pesanan/${transaksi.id}`,
    });

    // Notifikasi ke seller
    await this.notificationService.create({
      userId: transaksi.toko.userId,
      tipe: 'ORDER_NEW',
      title: 'Pesanan Baru',
      message: `Anda memiliki pesanan baru #${transaksi.id} dari ${transaksi.buyer.nama || transaksi.buyer.email}. Total: Rp ${transaksi.totalHarga.toLocaleString('id-ID')}`,
      link: `/seller/pesanan/${transaksi.id}`,
    });
  }

  private async restoreStockAndCancel(transaksi: any, tx: any) {
    for (const item of transaksi.detail) {
      await tx.produk.update({
        where: { id: item.produkId },
        data: { stok: { increment: item.qty } },
      });
    }

    await tx.transaksi.update({
      where: { id: transaksi.id },
      data: { statusPesanan: 'DIBATALKAN' },
    });

    await tx.orderHistory.create({
      data: {
        transaksiId: transaksi.id,
        statusSebelum: transaksi.statusPesanan,
        statusSesudah: 'DIBATALKAN',
        dibuatOleh: 0,
        catatan: 'Pembayaran gagal/expired, stok dikembalikan',
      },
    });
  }

  private async sendPaymentFailedNotifications(transaksi: any, tx: any) {
    await this.notificationService.create({
      userId: transaksi.buyerId,
      tipe: 'ORDER_FAILED',
      title: 'Pembayaran Gagal',
      message: `Pembayaran untuk pesanan #${transaksi.id} gagal atau kadaluarsa. Stok telah dikembalikan.`,
      link: `/pesanan/${transaksi.id}`,
    });
  }

  async expirePendingOrders() {
    const now = new Date();
    const expiredOrders = await this.prisma.transaksi.findMany({
      where: {
        statusPesanan: 'PENDING',
        expiredAt: { lt: now },
      },
      include: {
        detail: { include: { produk: true } },
        buyer: true,
        toko: { include: { user: true } },
      },
    });

    for (const transaksi of expiredOrders) {
      await this.prisma.$transaction(async (tx) => {
        for (const item of transaksi.detail) {
          await tx.produk.update({
            where: { id: item.produkId },
            data: { stok: { increment: item.qty } },
          });
        }

        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: { statusPesanan: 'DIBATALKAN' },
        });

        await tx.orderHistory.create({
          data: {
            transaksiId: transaksi.id,
            statusSebelum: 'PENDING',
            statusSesudah: 'DIBATALKAN',
            dibuatOleh: 0,
            catatan: 'Pembayaran kadaluarsa 15 menit, stok dikembalikan',
          },
        });
      });

      // Notifikasi ke buyer
      await this.notificationService.create({
        userId: transaksi.buyerId,
        tipe: 'ORDER_EXPIRED',
        title: 'Pesanan Kadaluarsa',
        message: `Pesanan #${transaksi.id} dibatalkan karena pembayaran tidak dilakukan dalam 15 menit.`,
        link: `/pesanan/${transaksi.id}`,
      });
    }

    return { expiredCount: expiredOrders.length };
  }

  private getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }
}