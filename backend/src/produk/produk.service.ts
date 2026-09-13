import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';

@Injectable()
export class ProdukService {
  constructor(private readonly prisma: PrismaService) {}

  // Buat halaman BERANDA (buyer) — cuma produk yang Aktif
  async findAllPublished() {
    return this.prisma.produk.findMany({
      where: { statusProduk: 'Aktif' },
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

  async create(dto: CreateProdukDto) {
    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: dto.tokoId },
    });

    if (!toko) {
      throw new BadRequestException('Toko tidak ditemukan!');
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

  async update(id: number, dto: UpdateProdukDto) {
    await this.findOne(id);

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
  async toggleStatus(id: number) {
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

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.produk.delete({ where: { id } });
    return { message: 'Produk berhasil dihapus' };
  }
}
