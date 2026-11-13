import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  StatusVerif,
  Role,
  StatusAkun,
  StatusPesanan,
  StatusProduk,
} from '@prisma/client';

const FEE_RATE = 0.1;
const PAID_STATUSES: StatusPesanan[] = ['DIPROSES', 'DIKIRIM', 'SELESAI'];
const REFUND_STATUSES: StatusPesanan[] = ['DIBATALKAN', 'DITOLAK'];

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingSeller() {
    return await this.prisma.tokoSeller.findMany({
      where: {
        statusVerif: StatusVerif.Pending,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            noTelp: true,
          },
        },
      },
    });
  }

  async verifySeller(tokoId: string, status: 'APPROVED' | 'REJECTED') {
    const idToko = Number(tokoId);

    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: idToko },
    });

    if (!toko) {
      throw new NotFoundException('Data toko tidak ditemukan');
    }

    const isApproved = status === 'APPROVED';

    const updatedToko = await this.prisma.tokoSeller.update({
      where: { id: idToko },
      data: {
        statusVerif: isApproved ? StatusVerif.Approved : StatusVerif.Rejected,
      },
    });

    if (isApproved) {
      await this.prisma.user.update({
        where: { id: toko.userId },
        data: { role: Role.Seller },
      });
    }

    return updatedToko;
  }

  async getDashboardStats() {
    const [totalBuyers, totalSellers, revenueAggregate] = await Promise.all([
      this.prisma.user.count({
        where: { role: Role.Buyer, statusAkun: StatusAkun.Aktif },
      }),
      this.prisma.user.count({
        where: { role: Role.Seller, statusAkun: StatusAkun.Aktif },
      }),
      this.prisma.transaksi.aggregate({
        _sum: { totalHarga: true },
        where: { statusPesanan: { in: PAID_STATUSES } },
      }),
    ]);

    const grossRevenue = revenueAggregate._sum.totalHarga ?? 0;

    return {
      systemStatus: 'ACTIVE',
      platformRevenue: Math.round(grossRevenue * FEE_RATE),
      totalBuyers,
      totalSellers,
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [paidTx, refunds, newUsers, newStores] = await Promise.all([
      this.prisma.transaksi.findMany({
        where: {
          waktuTransaksi: { gte: start, lt: end },
          statusPesanan: { in: PAID_STATUSES },
        },
        select: { totalHarga: true, waktuTransaksi: true },
      }),
      this.prisma.transaksi.count({
        where: {
          waktuTransaksi: { gte: start, lt: end },
          statusPesanan: { in: REFUND_STATUSES },
        },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end } },
      }),
      this.prisma.tokoSeller.count({
        where: { createdAt: { gte: start, lt: end } },
      }),
    ]);

    const grossRevenue = paidTx.reduce((sum, tx) => sum + tx.totalHarga, 0);

    // Kirim array penuh hanya jika ada transaksi, agar chart tidak menggambar
    // garis datar untuk bulan yang benar-benar kosong.
    const dailyTrend: { tanggal: number; jumlah: number }[] = [];
    if (paidTx.length > 0) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const counts = new Array(daysInMonth + 1).fill(0);
      for (const tx of paidTx) {
        counts[tx.waktuTransaksi.getDate()] += 1;
      }
      for (let day = 1; day <= daysInMonth; day++) {
        dailyTrend.push({ tanggal: day, jumlah: counts[day] });
      }
    }

    return {
      grossRevenue,
      completedTx: paidTx.length,
      refunds,
      newUsers,
      newStores,
      dailyTrend,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        statusAkun: true,
        noTelp: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async suspendUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { toko: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.role === Role.Admin) {
      throw new BadRequestException('Akun admin tidak dapat dinonaktifkan');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { statusAkun: StatusAkun.Suspend },
      });

      if (user.toko) {
        await tx.produk.updateMany({
          where: { tokoId: user.toko.id },
          data: { statusProduk: StatusProduk.Nonaktif },
        });
      }
    });

    return {
      message: 'Akun berhasil dinonaktifkan',
      userId,
    };
  }
}
