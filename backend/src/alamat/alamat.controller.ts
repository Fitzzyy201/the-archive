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
import { AlamatService } from './alamat.service';
import { CreateAlamatDto, UpdateAlamatDto } from './dto/alamat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Alamat')
@Controller('alamat')
export class AlamatController {
  constructor(private readonly alamatService: AlamatService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req, @Body() dto: CreateAlamatDto) {
    return this.alamatService.create(req.user.sub, dto);
  }

  // Frontend cart-buyer belum mengirim Authorization header, jadi endpoint ini publik.
  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
    return this.alamatService.getByUser(+userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateAlamatDto) {
    return this.alamatService.update(+id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async delete(@Request() req, @Param('id') id: string) {
    return this.alamatService.delete(+id, req.user.sub);
  }
}
