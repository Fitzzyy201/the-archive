import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Role Seller sudah diberikan saat registrasi, sebelum admin menyetujui.
// Guard ini menahan aksi tulis sampai status toko benar-benar Approved.
@Injectable()
export class TokoVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Token tidak valid');
    }

    const toko = await this.prisma.tokoSeller.findUnique({
      where: { userId },
      select: {
        id: true,
        statusVerif: true,
        user: { select: { statusAkun: true } },
      },
    });

    if (!toko || toko.statusVerif !== 'Approved') {
      throw new ForbiddenException('Toko Anda belum diverifikasi oleh admin');
    }

    if (toko.user.statusAkun !== 'Aktif') {
      throw new ForbiddenException('Akun Anda sudah dinonaktifkan');
    }

    request.tokoId = toko.id;
    return true;
  }
}
