import { Body, Controller, Post } from '@nestjs/common';
import { TokoService } from './toko.service';
import { CreateTokoDto } from './dto/create-toko.dto';

@Controller('toko')
export class TokoController {
  constructor(private readonly tokoService: TokoService) {}

  @Post('register-seller')
  async registerSeller(@Body() dto: CreateTokoDto) {
    return this.tokoService.registerSeller(dto);
  }
}
