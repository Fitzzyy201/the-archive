import { Module } from '@nestjs/common';
import { KeuanganController } from './keuangan.controller';
import { KeuanganService } from './keuangan.service';

@Module({
  controllers: [KeuanganController],
  providers: [KeuanganService],
  exports: [KeuanganService],
})
export class KeuanganModule {}
