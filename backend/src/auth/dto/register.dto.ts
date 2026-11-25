import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePhone, PHONE_REGEX } from '../../common/phone';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  nama!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @Transform(({ value }) => normalizePhone(value))
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(PHONE_REGEX, {
    message:
      'Nomor telepon harus diawali +62 dan berjumlah 10-14 digit angka (contoh: +6281234567890)',
  })
  noTelp!: string;
}
