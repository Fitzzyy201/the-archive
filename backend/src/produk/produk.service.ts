import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';

@Injectable()
export class ProdukService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwnership(produkId: number, userId: number) {
    const produk = await this.prisma.produk.findUnique({
      where: { id: produkId },
      select: { toko: { select: { userId: true } } },
    });

    if (!produk) {
      throw new BadRequestException('Produk tidak ditemukan!');
    }

    if (produk.toko.userId !== userId) {
      throw new ForbiddenException('Produk ini bukan milik toko Anda');
    }

    return produk;
  }

  // Buat halaman BERANDA (buyer) — cuma produk yang Aktif
  async findAllPublished() {
    return this.prisma.produk.findMany({
      where: {
        statusProduk: 'Aktif',
        toko: { user: { statusAkun: 'Aktif' } },
      },
      include: {
        toko: {
          select: { namaToko: true, kota: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  // Buat halaman PRODUK-SELLER — semua produk milik 1 toko
  async findAllByToko(tokoId: number) {
    return this.prisma.produk.findMany({
      where: { tokoId },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const produk = await this.prisma.produk.findUnique({
      where: { id },
      include: { toko: { select: { namaToko: true, kota: true } } },
    });

    if (!produk) {
      throw new BadRequestException('Produk tidak ditemukan!');
    }

    return produk;
  }

  async create(dto: CreateProdukDto, userId: number) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: dto.tokoId },
    });

    if (!toko) {
      throw new BadRequestException('Toko tidak ditemukan!');
    }

    if (toko.userId !== userId) {
      throw new ForbiddenException('Toko ini bukan milik Anda');
    }

    const produk = await this.prisma.produk.create({
      data: {
        tokoId: dto.tokoId,
        namaProduk: dto.namaProduk,
        deskripsi: dto.deskripsi,
        harga: dto.harga,
        stok: dto.stok,
        ukuranDimensi: dto.ukuranDimensi,
        fotoProduk: dto.fotoProduk ?? "",
        defect: dto.defect ?? false,
      },
    });

    return {
      message: 'Produk berhasil ditambahkan',
      produk,
    };
  }

  async update(id: number, dto: UpdateProdukDto, userId: number) {
    await this.assertOwnership(id, userId);

    const produk = await this.prisma.produk.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Produk berhasil diperbarui',
      produk,
    };
  }

  // Toggle Aktif <-> Nonaktif
  async toggleStatus(id: number, userId: number) {
    await this.assertOwnership(id, userId);
    const produk = await this.findOne(id);
    const statusBaru = produk.statusProduk === 'Aktif' ? 'Nonaktif' : 'Aktif';

    const updated = await this.prisma.produk.update({
      where: { id },
      data: { statusProduk: statusBaru },
    });

    return {
      message: `Produk berhasil di-${statusBaru === 'Aktif' ? 'aktifkan' : 'nonaktifkan'}`,
      produk: updated,
    };
  }

  async remove(id: number, userId: number) {
    await this.assertOwnership(id, userId);
    await this.prisma.produk.delete({ where: { id } });
    return { message: 'Produk berhasil dihapus' };
  }
}
