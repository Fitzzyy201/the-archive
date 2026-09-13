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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
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

    const phoneExists = await this.prisma.user.findFirst({
      where: { noTelp: dto.noTelp },
    });

    if (phoneExists) {
      throw new HttpException(
        'Nomor telepon sudah terdaftar, gunakan nomor telepon lain!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        nama: dto.nama,
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
      id: user.id,
      role: user.role,
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

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Kode OTP Reset Password - The Archive',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #faf9f6;">
            <h2 style="font-family: serif; color: #111; text-align: center; margin-bottom: 8px;">THE ARCHIVE</h2>
            <p style="text-align: center; font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 0;">Password Recovery</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;" />
            <p style="color: #333; font-size: 14px; line-height: 1.6;">Halo,</p>
            <p style="color: #444; font-size: 14px; line-height: 1.6;">Kami menerima permintaan untuk mereset kata sandi akun Anda. Gunakan kode verifikasi OTP berikut:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; background-color: #000; color: #fff; border-radius: 4px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 12px; line-height: 1.5; text-align: center;">Kode OTP ini hanya berlaku selama <strong>10 menit</strong>. Jangan berikan kode ini kepada siapa pun.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <p style="color: #999; font-size: 10px; text-align: center;">Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
          </div>
        `,
      });
      console.log(`[EMAIL BERHASIL DIKIRIM] Kepada: ${email} | Kode OTP: ${otp}`);
    } catch (mailError) {
      console.error('Gagal mengirim email via Nodemailer:', mailError);
      throw new HttpException(
        'Gagal mengirim email OTP. Periksa konfigurasi SMTP di .env (MAIL_USER, MAIL_PASS).',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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
