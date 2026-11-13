import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlamatDto, UpdateAlamatDto } from './dto/alamat.dto';

@Injectable()
export class AlamatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateAlamatDto) {
    return this.prisma.alamatPengiriman.create({
      data: { userId, ...dto },
    });
  }

  async getByUser(userId: number) {
    // Return first address as primary for now
    const alamat = await this.prisma.alamatPengiriman.findFirst({
      where: { userId },
    });
    if (!alamat) throw new NotFoundException('Alamat tidak ditemukan');
    return alamat;
  }

  async update(id: number, userId: number, dto: UpdateAlamatDto) {
    const existing = await this.prisma.alamatPengiriman.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Alamat tidak ditemukan');
    return this.prisma.alamatPengiriman.update({ where: { id }, data: dto });
  }

  async delete(id: number, userId: number) {
    const existing = await this.prisma.alamatPengiriman.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException('Alamat tidak ditemukan');
    return this.prisma.alamatPengiriman.delete({ where: { id } });
  }
}
