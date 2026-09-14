import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nomor resi wajib diisi' })
  @MaxLength(100, { message: 'Nomor resi maksimal 100 karakter' })
  nomorResi: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama ekspedisi wajib diisi' })
  @MaxLength(100, { message: 'Nama ekspedisi maksimal 100 karakter' })
  ekspedisi: string;

  @IsString()
  @IsNotEmpty({ message: 'Bukti resi (URL file) wajib diisi' })
  buktiResi: string;
}