import { IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizePhone, PHONE_REGEX } from '../../common/phone';

export class UpdateTokoDto {
  @IsOptional()
  @IsString()
  namaToko?: string;

  @IsOptional()
  @Transform(({ value }) => normalizePhone(value))
  @Matches(PHONE_REGEX, {
    message:
      'Nomor telepon harus diawali +62 dan berjumlah 10-14 digit angka (contoh: +6281234567890)',
  })
  noToko?: string;

  @IsOptional()
  @IsString()
  kota?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  fotoToko?: string;
}
