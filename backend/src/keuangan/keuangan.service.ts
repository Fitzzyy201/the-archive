import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KeuanganService {
  constructor(private readonly prisma: PrismaService) {}

  async getKeuanganByToko(tokoId: number) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: tokoId },
      select: { saldoToko: true, userId: true },
    });

    if (!toko) {
      return {
        saldoToko: 0,
        penarikanPending: null,
        riwayat: [],
      };
    }

    const riwayat = await this.prisma.logKeuangan.findMany({
      where: { userId: toko.userId },
      orderBy: { waktuLog: 'desc' },
      take: 50,
    });

    return {
      saldoToko: toko.saldoToko,
      penarikanPending: null,
      riwayat,
    };
  }
}
