import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { RejectOrderDto } from './dto/reject-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TokoVerifiedGuard } from '../auth/guards/toko-verified.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Seller Orders')
@Controller('seller/orders')
@UseGuards(JwtAuthGuard, RolesGuard, TokoVerifiedGuard)
@Roles('Seller')
@ApiBearerAuth()
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  @Get()
  async getAllOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.pesananService.getOrdersByToko(req.tokoId, query);
  }

  @Get('incoming')
  async getIncomingOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.pesananService.getIncomingOrders(req.tokoId, query);
  }

  @Get('to-ship')
  async getOrdersToShip(@Request() req, @Query() query: OrderQueryDto) {
    return this.pesananService.getOrdersToShip(req.tokoId, query);
  }

  @Get('history')
  async getOrderHistory(@Request() req, @Query() query: OrderQueryDto) {
    return this.pesananService.getOrderHistory(req.tokoId, query);
  }

  @Get(':id')
  async getOrderDetail(@Request() req, @Param('id') id: string) {
    return this.pesananService.getOrderDetail(+id, req.tokoId);
  }

  @Post(':id/accept')
  async acceptOrder(@Request() req, @Param('id') id: string) {
    return this.pesananService.acceptOrder(+id, req.tokoId, req.user.sub);
  }

  @Post('accept-all')
  async acceptAllOrders(@Request() req) {
    return this.pesananService.acceptAllOrders(req.tokoId, req.user.sub);
  }

  @Post(':id/reject')
  async rejectOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RejectOrderDto,
  ) {
    return this.pesananService.rejectOrder(+id, req.tokoId, req.user.sub, dto);
  }

  @Post(':id/ship')
  async shipOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ShipOrderDto,
  ) {
    return this.pesananService.shipOrder(+id, req.tokoId, req.user.sub, dto);
  }

  @Post(':id/cancel')
  async cancelOrder(@Request() req, @Param('id') id: string) {
    return this.pesananService.cancelOrder(+id, req.tokoId, req.user.sub);
  }
}
