import { IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { normalizePhone, PHONE_REGEX } from '../../common/phone';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => normalizePhone(value))
  @Matches(PHONE_REGEX, {
    message:
      'Nomor telepon harus diawali +62 dan berjumlah 10-14 digit angka (contoh: +6281234567890)',
  })
  noTelp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoProfil?: string;
}
