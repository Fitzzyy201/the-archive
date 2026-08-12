import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new HttpException(
        'Email udah terdaftar, pakai email lain bro!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        noTelp: dto.noTelp,
      },
    });

    return {
      message: 'Berhasil daftar akun!',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new HttpException(
        'Email atau password salah!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    console.log('Data Payload dari Frontend:', dto);
    console.log('Data User dari Database:', user);

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        'Email atau password salah!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil!',
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        toko: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'Jika email terdaftar, kode OTP akan dikrim.' };
    }

    if (user.role == 'Admin') {
      throw new UnauthorizedException(
        ' Admin tidak diizinkan mereset password melalui jalur ini. ',
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpires: expires },
    });

    //  TODO: Nanti bagian ini harus dihubungkan ke layanan email -ini bukan ai tapi gw yg ngetik
    console.log(`[EMAIL SIMULASI] Kepada: ${email} | Kode OTP anda: ${otp}`);

    return { message: 'Kode OTP telah dikirim ke email anda.' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otpCode !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      throw new UnauthorizedException(
        'Kode OTP tidak valid atau sudah kadaluarsa.',
      );
    }
    return { message: 'OTP Valid' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otpCode !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      throw new UnauthorizedException('Sesi reset Password tidak valid.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpires: null,
      },
    });
    return { message: 'Password berhasil diubah. Silakan login' };
  }
}
