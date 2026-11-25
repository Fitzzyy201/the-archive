import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusPesanan } from '@prisma/client';

const PAID_STATUSES: StatusPesanan[] = ['DIPROSES', 'DIKIRIM', 'SELESAI'];
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PenjualanService {
  constructor(private readonly prisma: PrismaService) {}

  async getRingkasan(
    tokoId: number,
    periode?: string,
    dari?: string,
    sampai?: string,
  ) {
    const { start, end, divisor } = this.resolveRange(periode, dari, sampai);

    const orders = await this.prisma.transaksi.findMany({
      where: {
        tokoId,
        waktuTransaksi: { gte: start, lt: end },
        statusPesanan: { in: PAID_STATUSES },
      },
      select: {
        totalHarga: true,
        detail: { select: { qty: true } },
      },
    });

    const totalTerjual = orders.reduce(
      (sum, order) =>
        sum + order.detail.reduce((qtySum, detail) => qtySum + detail.qty, 0),
      0,
    );
    const totalPendapatan = orders.reduce(
      (sum, order) => sum + order.totalHarga,
      0,
    );

    return {
      totalTerjual,
      totalPendapatan,
      rataRata: totalTerjual / divisor,
    };
  }

  private resolveRange(periode?: string, dari?: string, sampai?: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parseDate = (value?: string) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    let start: Date;
    let end: Date;

    const dariDate = parseDate(dari);
    const sampaiDate = parseDate(sampai);

    if (dariDate || sampaiDate) {
      start = dariDate ?? startOfToday;
      end = sampaiDate
        ? new Date(sampaiDate.getTime() + DAY_MS)
        : new Date(startOfToday.getTime() + DAY_MS);
    } else if (periode === 'mingguan') {
      start = new Date(startOfToday.getTime() - 6 * DAY_MS);
      end = new Date(startOfToday.getTime() + DAY_MS);
    } else if (periode === 'bulanan') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      start = startOfToday;
      end = new Date(startOfToday.getTime() + DAY_MS);
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS));
    const divisor =
      periode === 'mingguan'
        ? Math.max(1, Math.ceil(days / 7))
        : periode === 'bulanan'
          ? Math.max(1, Math.ceil(days / 30))
          : days;

    return { start, end, divisor };
  }
}
