import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePhone, PHONE_REGEX } from '../../common/phone';

export class CreateTokoDto {
  namaToko!: string;

  @Transform(({ value }) => normalizePhone(value))
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(PHONE_REGEX, {
    message:
      'Nomor telepon harus diawali +62 dan berjumlah 10-14 digit angka (contoh: +6281234567890)',
  })
  noTelp!: string;

  email!: string;
  password!: string;
  kota!: string;
  fotoKtp!: string;
  nik!: string;
  npwp!: string;
  fotoSkck!: string;
  noRekening!: string;
}
