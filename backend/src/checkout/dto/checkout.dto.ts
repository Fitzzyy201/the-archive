import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutDto {
  @IsInt()
  @IsNotEmpty({ message: 'ID alamat pengiriman wajib diisi' })
  alamatId: number;

  @IsString()
  @IsOptional()
  catatan?: string;

  @IsString()
  @IsNotEmpty({ message: 'Payment method wajib diisi' })
  paymentMethod: string; // 'MIDTRANS'
}

export class CheckoutResponseDto {
  transaksiId: number;
  midtransToken: string;
  redirectUrl: string;
  expiredAt: Date;
  totalHarga: number;
}

export class CheckoutPreviewDto {
  @IsInt()
  @IsNotEmpty()
  alamatId: number;

  @IsString()
  @IsOptional()
  catatan?: string;
}
