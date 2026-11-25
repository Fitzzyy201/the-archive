import { Controller, Get, Query } from '@nestjs/common';
import { WilayahService } from './wilayah.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Wilayah')
@Controller('wilayah')
export class WilayahController {
  constructor(private readonly wilayahService: WilayahService) {}

  @Get('provinces')
  async getProvinces() {
    return this.wilayahService.getProvinces();
  }

  @Get('regencies')
  async getRegencies(@Query('provinceId') provinceId?: string) {
    return this.wilayahService.getRegencies(provinceId);
  }

  @Get('districts')
  async getDistricts(@Query('regencyId') regencyId?: string) {
    return this.wilayahService.getDistricts(regencyId);
  }
}
