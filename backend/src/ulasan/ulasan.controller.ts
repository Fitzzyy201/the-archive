import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UlasanService } from './ulasan.service';
import { CreateUlasanDto, UpdateUlasanDto } from './dto/ulasan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ulasan')
@Controller('ulasan')
export class UlasanController {
  constructor(private readonly ulasanService: UlasanService) {}

  @Get('produk/:produkId')
  findByProduk(@Param('produkId') produkId: string) {
    return this.ulasanService.findByProduk(+produkId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Buyer')
  @ApiBearerAuth()
  create(@Request() req, @Body() dto: CreateUlasanDto) {
    return this.ulasanService.create(req.user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Buyer')
  @ApiBearerAuth()
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateUlasanDto) {
    return this.ulasanService.update(+id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Request() req, @Param('id') id: string) {
    return this.ulasanService.remove(+id, req.user.sub, req.user.role);
  }
}
