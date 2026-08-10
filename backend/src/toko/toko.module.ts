import { Module } from '@nestjs/common';
import { TokoService } from './toko.service';
import { TokoController } from './toko.controller';

@Module({
  controllers: [TokoController],
  providers: [TokoService],
})
export class TokoModule {}
