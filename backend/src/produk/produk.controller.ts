import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
}
