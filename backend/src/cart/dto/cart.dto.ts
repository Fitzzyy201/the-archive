import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty({ message: 'ID produk wajib diisi' })
  produkId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Kuantitas minimal 1' })
  @Max(99, { message: 'Kuantitas maksimal 99' })
  qty: number;
}

export class UpdateCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Kuantitas minimal 0 (0 = hapus item)' })
  @Max(99, { message: 'Kuantitas maksimal 99' })
  qty: number;
}

export class CartQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}