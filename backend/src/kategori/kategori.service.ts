import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKategoriDto, UpdateKategoriDto } from './dto/kategori.dto';

@Injectable()
export class KategoriService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  findAll() {
    return this.prisma.kategori.findMany({
      where: { isActive: true },
      orderBy: { urutan: 'asc' },
    });
  }

  async findOne(id: number) {
    const kategori = await this.prisma.kategori.findUnique({ where: { id } });
    if (!kategori) throw new NotFoundException('Kategori tidak ditemukan');
    return kategori;
  }

  async create(dto: CreateKategoriDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.namaKategori);

    const exists = await this.prisma.kategori.findFirst({
      where: { OR: [{ namaKategori: dto.namaKategori }, { slug }] },
    });
    if (exists) throw new BadRequestException('Nama kategori atau slug sudah ada');

    return this.prisma.kategori.create({
      data: {
        namaKategori: dto.namaKategori,
        slug,
        deskripsi: dto.deskripsi,
        fotoKategori: dto.fotoKategori,
        isActive: dto.isActive,
        urutan: dto.urutan,
      },
    });
  }

  async update(id: number, dto: UpdateKategoriDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.namaKategori && !dto.slug) data.slug = this.slugify(dto.namaKategori);
    else if (dto.slug) data.slug = this.slugify(dto.slug);

    return this.prisma.kategori.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.kategori.delete({ where: { id } });
    return { message: 'Kategori berhasil dihapus' };
  }
}
