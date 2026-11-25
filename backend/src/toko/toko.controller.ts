import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';
import { UpdateTokoDto } from './dto/update-toko.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Toko')
@Controller('toko')
export class TokoController {
  constructor(private readonly tokoService: TokoService) {}

  @Post('register-seller')
  async registerSeller(@Body() dto: CreateTokoDto) {
    return this.tokoService.registerSeller(dto);
  }

  @Patch('verifikasi/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  async verifikasiToko(
    @Param('id') id: string,
    @Body() body: { status: 'Approved' | 'Rejected'; alasanPenolakan?: string },
  ) {
    return this.tokoService.verifikasiToko(
      +id,
      body.status,
      body.alasanPenolakan,
    );
  }

  @Get('status-my-shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyShopStatus(@Request() req) {
    return this.tokoService.getMyShopStatus(req.user.sub);
  }

  @Get(':id')
  async getTokoDetail(@Param('id') id: string) {
    return this.tokoService.getTokoDetail(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Seller')
  @ApiBearerAuth()
  async updateTokoDetail(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateTokoDto,
  ) {
    return this.tokoService.updateTokoDetail(+id, body, req.user.sub);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTokoByUserId(@Request() req, @Param('userId') userId: string) {
    if (Number(userId) !== req.user.sub) {
      throw new ForbiddenException('Anda hanya dapat mengakses toko milik Anda sendiri');
    }
    return this.tokoService.getTokoByUserId(+userId);
  }
}
