import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUlasanDto, UpdateUlasanDto } from './dto/ulasan.dto';

@Injectable()
export class UlasanService {
  constructor(private readonly prisma: PrismaService) {}

  findByProduk(produkId: number) {
    return this.prisma.ulasan.findMany({
      where: { produkId },
      include: {
        buyer: { select: { id: true, nama: true, fotoProfil: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: number, dto: CreateUlasanDto) {
    const produk = await this.prisma.produk.findUnique({
      where: { id: dto.produkId },
    });
    if (!produk) throw new NotFoundException('Produk tidak ditemukan');

    const sudahMemberiUlasan = await this.prisma.ulasan.findFirst({
      where: { buyerId: userId, produkId: dto.produkId },
    });
    if (sudahMemberiUlasan) {
      throw new BadRequestException('Anda sudah memberikan ulasan untuk produk ini');
    }

    return this.prisma.ulasan.create({
      data: {
        buyerId: userId,
        produkId: dto.produkId,
        rating: dto.rating,
        komentar: dto.komentar,
      },
    });
  }

  private async assertOwnership(id: number, userId: number) {
    const ulasan = await this.prisma.ulasan.findUnique({ where: { id } });
    if (!ulasan) throw new NotFoundException('Ulasan tidak ditemukan');
    if (ulasan.buyerId !== userId) {
      throw new ForbiddenException('Ulasan ini bukan milik Anda');
    }
    return ulasan;
  }

  async update(id: number, userId: number, dto: UpdateUlasanDto) {
    await this.assertOwnership(id, userId);
    return this.prisma.ulasan.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number, role: string) {
    if (role !== 'Admin') {
      await this.assertOwnership(id, userId);
    } else {
      const ulasan = await this.prisma.ulasan.findUnique({ where: { id } });
      if (!ulasan) throw new NotFoundException('Ulasan tidak ditemukan');
    }
    await this.prisma.ulasan.delete({ where: { id } });
    return { message: 'Ulasan berhasil dihapus' };
  }
}
