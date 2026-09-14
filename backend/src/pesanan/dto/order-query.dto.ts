import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusPesanan } from '@prisma/client';

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(StatusPesanan, { message: 'Status tidak valid' })
  status?: StatusPesanan;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Halaman harus berupa angka' })
  @Min(1, { message: 'Halaman minimal 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka' })
  @Min(1, { message: 'Limit minimal 1' })
  @Max(50, { message: 'Limit maksimal 50' })
  limit?: number = 10;
}