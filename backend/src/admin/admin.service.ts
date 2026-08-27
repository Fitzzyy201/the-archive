import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusVerif, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingSeller() {
    return await this.prisma.tokoSeller.findMany({
      where: {
        statusVerif: StatusVerif.Pending,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            noTelp: true,
          },
        },
      },
    });
  }

  async verifySeller(tokoId: string, status: 'APPROVED' | 'REJECTED') {
    const idToko = Number(tokoId);

    const toko = await this.prisma.tokoSeller.findUnique({
      where: { id: idToko },
    });

    if (!toko) {
      throw new NotFoundException('Data toko tidak ditemukan');
    }

    const isApproved = status === 'APPROVED';

    const updatedToko = await this.prisma.tokoSeller.update({
      where: { id: idToko },
      data: {
        statusVerif: isApproved ? StatusVerif.Approved : StatusVerif.Rejected,
      },
    });

    if (isApproved) {
      await this.prisma.user.update({
        where: { id: toko.userId },
        data: { role: Role.Seller },
      });
    }

    return updatedToko;
  }
}
