import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTokoDto } from './dto/create-toko.dto';
import * as bcrypt from 'bcrypt';
import { Role, StatusVerif } from '@prisma/client';

@Injectable()
export class TokoService {
  constructor(private readonly prisma: PrismaService) {}

  async registerSeller(dto: CreateTokoDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. User dibuat dengan role 'Buyer' dulu (bukan langsung Seller)
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          noTelp: dto.noTelp,
          role: Role.Buyer, // <-- UBAH KE Buyer
        },
      });

      // 2. Buat record toko dengan statusVerif 'Pending'
      const toko = await tx.tokoSeller.create({
        data: {
          userId: user.id,
          namaToko: dto.namaToko,
          kota: dto.kota,
          noTelp: dto.noTelp,
          noRekening: dto.noRekening,
          fotoKtp: dto.fotoKtp,
          fotoSkck: dto.fotoSkck,
          statusVerif: StatusVerif.Pending,
        },
      });

      return { user, toko };
    });

    return {
      message: 'Registrasi Seller berhasil! Menunggu verifikasi Admin.',
      tokoId: result.toko.id,
      namaToko: result.toko.namaToko,
      status: result.toko.statusVerif,
    };
  }

  async verifikasiToko(
    tokoId: number,
    status: 'Approved' | 'Rejected',
    alasanPenolakan?: string,
  ) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: tokoId },
    });

    if (!toko) {
      throw new BadRequestException('Toko tidak ditemukan!');
    }

    const updateToko = await this.prisma.tokoSeller.update({
      where: { id: tokoId },
      data: {
        statusVerif:
          status === 'Approved' ? StatusVerif.Approved : StatusVerif.Rejected,
        alasanPenolakan: status === 'Rejected' ? alasanPenolakan : null,
      },
    });

    // Jika disetujui (Approved), BARU ubah role user pemiliknya menjadi 'Seller'
    if (status === 'Approved') {
      await this.prisma.user.update({
        where: { id: toko.userId },
        data: { role: Role.Seller },
      });
    }

    return {
      message: `Status toko berhasil diubah menjadi ${status}`,
      toko: updateToko,
    };
  }

  async getMyShopStatus(userId: number) {
    // Cari toko yang dimiliki oleh user yang sedang login
    const toko = await this.prisma.tokoSeller.findFirst({
      where: { userId: userId },
      orderBy: { id: 'desc' }, // Ambil data pengajuan terbaru kalau misal ada double
    });

    if (!toko) {
      // Kalau ternyata user ini belum pernah daftar toko sama sekali
      return { statusVerif: null };
    }

    // Kembalikan ID toko dan statusnya buat dibaca frontend
    return {
      id: toko.id,
      statusVerif: toko.statusVerif,
      namaToko: toko.namaToko,
    };
  }
}
