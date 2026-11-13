import { Module } from '@nestjs/common';
import { UlasanService } from './ulasan.service';
import { UlasanController } from './ulasan.controller';

@Module({
  controllers: [UlasanController],
  providers: [UlasanService],
  exports: [UlasanService],
})
export class UlasanModule {}
