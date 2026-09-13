import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProdukService } from './produk.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';

@Controller('produk')
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @Get()
  async findAllPublished() {
    return this.produkService.findAllPublished();
  }

  @Get('toko/:tokoId')
  async findAllByToko(@Param('tokoId') tokoId: string) {
    return this.produkService.findAllByToko(+tokoId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.produkService.findOne(+id);
  }

  @Post()
  async create(@Body() dto: CreateProdukDto) {
    return this.produkService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProdukDto) {
    return this.produkService.update(+id, dto);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.produkService.toggleStatus(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.produkService.remove(+id);
  }

  @Post('upload-foto')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }
    return {
      message: 'Foto berhasil diupload',
      url: `/uploads/${file.filename}`,
    };
  }
}
