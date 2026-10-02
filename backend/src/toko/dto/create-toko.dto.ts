import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateTokoDto {
  @IsNotEmpty({ message: 'Nama toko wajib diisi' })
  @IsString()
  namaToko!: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(/^[0-9]+$/, { message: 'Nomor telepon hanya boleh berisi angka' })
  @MinLength(10, { message: 'Nomor telepon minimal 10 digit' })
  noTelp!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsNotEmpty({ message: 'Kota wajib diisi' })
  @IsString()
  kota!: string;

  @IsNotEmpty({ message: 'Foto KTP wajib diisi' })
  @IsString()
  fotoKtp!: string;

  @IsNotEmpty({ message: 'NIK wajib diisi' })
  @Matches(/^[0-9]{16}$/, { message: 'NIK harus 16 digit angka' })
  nik!: string;

  @IsNotEmpty({ message: 'NPWP wajib diisi' })
  @IsString()
  npwp!: string;

  @IsNotEmpty({ message: 'Foto SKCK wajib diisi' })
  @IsString()
  fotoSkck!: string;

  @IsNotEmpty({ message: 'Nomor rekening wajib diisi' })
  @Matches(/^[0-9]+$/, { message: 'Nomor rekening hanya boleh berisi angka' })
  noRekening!: string;
}
