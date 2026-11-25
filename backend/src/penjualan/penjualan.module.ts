import { Module } from '@nestjs/common';
import { PenjualanController } from './penjualan.controller';
import { PenjualanService } from './penjualan.service';

@Module({
  controllers: [PenjualanController],
  providers: [PenjualanService],
  exports: [PenjualanService],
})
export class PenjualanModule {}
