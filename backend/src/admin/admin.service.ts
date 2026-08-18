import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusVerif } from '@prisma/client';

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

  async verifySeller(userId: string, status: 'APPROVED' | 'REJECTED') {
    return await this.prisma.tokoSeller.update({
      where: {
        id: Number(userId),
      },
      data: {
        statusVerif:
          status === 'APPROVED' ? StatusVerif.Approved : StatusVerif.Rejected,
      },
    });
  }
}
