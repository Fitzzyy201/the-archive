import { Module } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { PesananController } from './pesanan.controller';
import { BuyerOrdersController } from './buyer-orders.controller';

@Module({
  controllers: [PesananController, BuyerOrdersController],
  providers: [PesananService],
  exports: [PesananService],
})
export class PesananModule {}
