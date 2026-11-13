import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  noTelp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fotoProfil?: string;
}
