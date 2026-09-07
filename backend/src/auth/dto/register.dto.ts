import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  nama!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(/^[0-9]+$/, { message: 'Nomor telepon hanya boleh berisi angka' })
  noTelp!: string;
}
