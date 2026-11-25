import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TarikDanaDto } from './dto/tarik-dana.dto';
import { JenisTransaksi } from '@prisma/client';

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

  async tarikDana(tokoId: number, userId: number, dto: TarikDanaDto) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: tokoId },
    });

    if (!toko) {
      throw new NotFoundException('Toko tidak ditemukan');
    }

    if (dto.nominal > toko.saldoToko) {
      throw new BadRequestException('Saldo tidak mencukupi');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.tokoSeller.update({
        where: { id: tokoId },
        data: { saldoToko: { decrement: dto.nominal } },
      });

      return await tx.logKeuangan.create({
        data: {
          userId,
          jenisTransaksi: JenisTransaksi.PencairanSeller,
          nominal: dto.nominal,
        },
      });
    });
  }
}
