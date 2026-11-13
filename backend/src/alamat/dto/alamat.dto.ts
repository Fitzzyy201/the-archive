import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlamatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  namaPenerima: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  kotaPenerima: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  alamatLengkap: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatanKurir?: string;
}

export class UpdateAlamatDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  namaPenerima?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kotaPenerima?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  alamatLengkap?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatanKurir?: string;
}
