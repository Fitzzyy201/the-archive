import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKategoriDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  namaKategori: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoKategori?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  urutan?: number;
}

export class UpdateKategoriDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  namaKategori?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoKategori?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  urutan?: number;
}
