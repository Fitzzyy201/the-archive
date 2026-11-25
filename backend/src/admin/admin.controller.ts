import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending-sellers')
  async getPendingSeller() {
    return await this.adminService.getPendingSeller();
  }

  @Patch('verify-seller/:tokoId')
  async verifySeller(
    @Param('tokoId') tokoId: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return await this.adminService.verifySeller(tokoId, status);
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('monthly-report')
  async getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = Number(year);
    const m = Number(month);

    if (
      !year ||
      !month ||
      Number.isNaN(y) ||
      Number.isNaN(m) ||
      m < 1 ||
      m > 12 ||
      y < 2000 ||
      y > 2100
    ) {
      throw new BadRequestException('Parameter year dan month tidak valid');
    }

    return this.adminService.getMonthlyReport(y, m);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/:id')
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(+id);
  }

  @Patch('users/:id/suspend')
  async suspendUserPatch(@Param('id') id: string) {
    return this.adminService.suspendUser(+id);
  }

  @Delete('users/:id')
  async suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(+id);
  }

  @Get('komplain')
  async getKomplainList(@Query('status') status?: string) {
    return this.adminService.getKomplainList(status);
  }

  @Get('komplain/:id')
  async getKomplainDetail(@Param('id') id: string) {
    return this.adminService.getKomplainDetail(+id);
  }

  @Patch('komplain/:id')
  async decideKomplain(
    @Request() req,
    @Param('id') id: string,
    @Body('statusKomplain') statusKomplain: string,
    @Body('keputusanAdmin') keputusanAdmin: string,
  ) {
    if (statusKomplain !== 'Disetujui' && statusKomplain !== 'Ditolak') {
      throw new BadRequestException(
        'statusKomplain harus Disetujui atau Ditolak',
      );
    }

    if (!keputusanAdmin || !keputusanAdmin.trim()) {
      throw new BadRequestException('keputusanAdmin wajib diisi');
    }

    return this.adminService.decideKomplain(
      +id,
      req.user.sub,
      statusKomplain as 'Disetujui' | 'Ditolak',
      keputusanAdmin,
    );
  }

  @Get('finance')
  async getFinance() {
    return this.adminService.getFinance();
  }

  @Post('finance/withdraw')
  async withdrawAdmin(
    @Request() req,
    @Body('nominal') nominal: number,
    @Body('rekeningTujuan') rekeningTujuan: string,
  ) {
    return this.adminService.withdrawAdmin(
      req.user.sub,
      Number(nominal),
      rekeningTujuan,
    );
  }
}
