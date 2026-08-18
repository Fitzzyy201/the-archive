import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
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
}
