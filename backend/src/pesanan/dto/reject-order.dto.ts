import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Alasan penolakan wajib diisi' })
  @MaxLength(500, { message: 'Alasan penolakan maksimal 500 karakter' })
  alasanPenolakan: string;
}