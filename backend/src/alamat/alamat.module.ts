import { Module } from '@nestjs/common';
import { AlamatService } from './alamat.service';
import { AlamatController } from './alamat.controller';

@Module({
  controllers: [AlamatController],
  providers: [AlamatService],
  exports: [AlamatService],
})
export class AlamatModule {}
