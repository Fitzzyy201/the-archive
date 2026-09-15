import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTokoDto } from './dto/create-toko.dto';
import * as bcrypt from 'bcrypt';

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
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          noTelp: dto.noTelp,
          role: 'Seller',
        },
      });

      const toko = await tx.tokoSeller.create({
        data: {
          userId: user.id,
          namaToko: dto.namaToko,
          kota: dto.kota,
          noTelp: dto.noTelp,
          noRekening: dto.noRekening,
          fotoKtp: dto.fotoKtp,
          fotoSkck: dto.fotoSkck,
          statusVerif: 'Pending',
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
        statusVerif: status,
        alasanPenolakan: status === 'Rejected' ? alasanPenolakan : null,
      },
    });

    return {
      message: `Status toko berhasil diubah menjadi ${status}`,
      toko: updateToko,
    };
  }
    async getProfile(userId: number) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, fotoProfil: true },
        },
      },
    });

    if (!toko) {
      throw new BadRequestException('Toko tidak ditemukan!');
    }

    return {
      namaToko: toko.namaToko,
      kota: toko.kota,
      noTelp: toko.noTelp,
      email: toko.user.email,
      fotoProfil: toko.user.fotoProfil,
    };
  }

  async updateProfile(
    userId: number,
    dto: { namaToko?: string; kota?: string; noTelp?: string; fotoProfil?: string },
  ) {
    const toko = await this.prisma.tokoSeller.findUnique({ where: { userId } });

    if (!toko) {
      throw new BadRequestException('Toko tidak ditemukan!');
    }

    const updatedToko = await this.prisma.tokoSeller.update({
      where: { userId },
      data: {
        namaToko: dto.namaToko,
        kota: dto.kota,
        noTelp: dto.noTelp,
      },
    });

    if (dto.fotoProfil) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fotoProfil: dto.fotoProfil },
      });
    }

    return {
      message: 'Profil berhasil diperbarui',
      toko: updatedToko,
    };
  }
}
