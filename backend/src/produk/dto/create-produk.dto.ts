import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProdukDto {
  @IsInt()
  tokoId!: number;

  @IsString()
  @IsNotEmpty()
  namaProduk!: string;

  @IsString()
  @IsNotEmpty()
  deskripsi!: string;

  @IsInt()
  @Min(0)
  harga!: number;

  @IsInt()
  @Min(0)
  stok!: number;

  @IsString()
  @IsNotEmpty()
  ukuranDimensi!: string;

  @IsString()
  @IsNotEmpty()
  fotoProduk!: string;

  @IsBoolean()
  @IsOptional()
  defect?: boolean;
}