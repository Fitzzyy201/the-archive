import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class TarikDanaDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(10000, { message: 'Minimal penarikan Rp 10.000' })
  nominal: number;

  @IsString()
  @IsNotEmpty()
  metode: string;

  @IsString()
  @IsNotEmpty()
  noRekening: string;

  @IsString()
  @IsNotEmpty()
  namaPemilik: string;
}
