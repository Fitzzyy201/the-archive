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
  StatusKomplain,
  JenisTransaksi,
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

  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        noTelp: true,
        statusAkun: true,
        createdAt: true,
        alamatPengiriman: {
          select: {
            namaPenerima: true,
            kotaPenerima: true,
            alamatLengkap: true,
            catatanKurir: true,
          },
        },
        toko: {
          select: {
            namaToko: true,
            kota: true,
            noTelp: true,
            noRekening: true,
            fotoKtp: true,
            fotoSkck: true,
            statusVerif: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async getKomplainList(status?: string) {
    return this.prisma.komplain.findMany({
      where:
        status === 'pending'
          ? {
              statusKomplain: {
                in: [StatusKomplain.Menunggu, StatusKomplain.DalamProses],
              },
            }
          : undefined,
      include: {
        transaksi: {
          select: {
            waktuTransaksi: true,
            buyer: {
              select: { id: true, nama: true, username: true, email: true },
            },
            toko: { select: { namaToko: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getKomplainDetail(komplainId: number) {
    const komplain = await this.prisma.komplain.findUnique({
      where: { id: komplainId },
      include: {
        transaksi: {
          select: {
            waktuTransaksi: true,
            totalHarga: true,
            buyer: {
              select: {
                id: true,
                nama: true,
                username: true,
                email: true,
                noTelp: true,
                alamatPengiriman: {
                  select: {
                    namaPenerima: true,
                    kotaPenerima: true,
                    alamatLengkap: true,
                  },
                  take: 1,
                },
              },
            },
            toko: { select: { namaToko: true } },
          },
        },
      },
    });

    if (!komplain) {
      throw new NotFoundException('Komplain tidak ditemukan');
    }

    return komplain;
  }

  async decideKomplain(
    komplainId: number,
    adminId: number,
    statusKomplain: StatusKomplain,
    keputusanAdmin: string,
  ) {
    const komplain = await this.prisma.komplain.findUnique({
      where: { id: komplainId },
    });

    if (!komplain) {
      throw new NotFoundException('Komplain tidak ditemukan');
    }

    if (
      komplain.statusKomplain === StatusKomplain.Disetujui ||
      komplain.statusKomplain === StatusKomplain.Ditolak
    ) {
      throw new BadRequestException('Komplain sudah pernah diputuskan');
    }

    return this.prisma.komplain.update({
      where: { id: komplainId },
      data: { statusKomplain, keputusanAdmin, ditanganiOleh: adminId },
    });
  }

  async getFinance() {
    const [paidAggregate, withdrawnAggregate, logs] = await Promise.all([
      this.prisma.transaksi.aggregate({
        _sum: { totalHarga: true },
        where: { statusPesanan: { in: PAID_STATUSES } },
      }),
      this.prisma.logKeuangan.aggregate({
        _sum: { nominal: true },
        where: { jenisTransaksi: JenisTransaksi.WithdrawAdmin },
      }),
      this.prisma.logKeuangan.findMany({
        take: 100,
        orderBy: { waktuLog: 'desc' },
        include: {
          transaksi: { select: { totalHarga: true } },
        },
      }),
    ]);

    const paidTotal = paidAggregate._sum.totalHarga ?? 0;
    const withdrawnTotal = withdrawnAggregate._sum.nominal ?? 0;
    const escrowBalance = Math.round(paidTotal * FEE_RATE) - withdrawnTotal;

    return {
      escrowBalance,
      logs: logs.map((log) => ({
        id: log.id,
        transaksiId: log.transaksiId,
        jenisTransaksi: log.jenisTransaksi,
        waktuLog: log.waktuLog,
        totalIn: log.transaksi?.totalHarga ?? log.nominal,
        adminFee: Math.round((log.transaksi?.totalHarga ?? 0) * FEE_RATE),
        toSeller: Math.round(
          (log.transaksi?.totalHarga ?? 0) * (1 - FEE_RATE),
        ),
      })),
      rekeningAdmin: [] as string[],
    };
  }

  async withdrawAdmin(adminId: number, nominal: number, rekeningTujuan: string) {
    if (!Number.isFinite(nominal) || nominal <= 0) {
      throw new BadRequestException('Nominal penarikan tidak valid');
    }

    if (!rekeningTujuan || !String(rekeningTujuan).trim()) {
      throw new BadRequestException('Rekening tujuan wajib diisi');
    }

    const [paidAggregate, withdrawnAggregate] = await Promise.all([
      this.prisma.transaksi.aggregate({
        _sum: { totalHarga: true },
        where: { statusPesanan: { in: PAID_STATUSES } },
      }),
      this.prisma.logKeuangan.aggregate({
        _sum: { nominal: true },
        where: { jenisTransaksi: JenisTransaksi.WithdrawAdmin },
      }),
    ]);

    const escrowBalance =
      Math.round((paidAggregate._sum.totalHarga ?? 0) * FEE_RATE) -
      (withdrawnAggregate._sum.nominal ?? 0);

    if (nominal > escrowBalance) {
      throw new BadRequestException(
        'Nominal penarikan melebihi saldo escrow',
      );
    }

    const log = await this.prisma.logKeuangan.create({
      data: {
        userId: adminId,
        jenisTransaksi: JenisTransaksi.WithdrawAdmin,
        nominal,
      },
    });

    return {
      message: 'Penarikan dana berhasil diajukan',
      log,
      escrowBalance: escrowBalance - nominal,
    };
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
