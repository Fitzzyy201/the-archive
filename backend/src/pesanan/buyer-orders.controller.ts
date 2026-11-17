import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Buyer Orders')
@Controller('buyer/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BuyerOrdersController {
  constructor(private readonly pesananService: PesananService) {}

  @Get()
  async getMyOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.pesananService.getOrdersByBuyer(req.user.sub, query);
  }
}
