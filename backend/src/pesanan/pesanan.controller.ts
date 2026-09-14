import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { RejectOrderDto } from './dto/reject-order.dto';
import { ShipOrderDto } from './dto/ship-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('seller/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Seller')
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  private async getTokoIdFromToken(authHeader: string): Promise<number> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token tidak valid');
    }

    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };

    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService['getTokoIdFromUser'](userId);
  }

  @Get()
  async getAllOrders(
    @Headers('authorization') authHeader: string,
    @Query() query: OrderQueryDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    return this.pesananService.getOrdersByToko(tokoId, query);
  }

  @Get('incoming')
  async getIncomingOrders(
    @Headers('authorization') authHeader: string,
    @Query() query: OrderQueryDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    return this.pesananService.getIncomingOrders(tokoId, query);
  }

  @Get('to-ship')
  async getOrdersToShip(
    @Headers('authorization') authHeader: string,
    @Query() query: OrderQueryDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    return this.pesananService.getOrdersToShip(tokoId, query);
  }

  @Get('history')
  async getOrderHistory(
    @Headers('authorization') authHeader: string,
    @Query() query: OrderQueryDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    return this.pesananService.getOrderHistory(tokoId, query);
  }

  @Get(':id')
  async getOrderDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    return this.pesananService.getOrderDetail(+id, tokoId);
  }

  @Post(':id/accept')
  async acceptOrder(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };
    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService.acceptOrder(+id, tokoId, userId);
  }

  @Post('accept-all')
  async acceptAllOrders(
    @Headers('authorization') authHeader: string,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };
    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService.acceptAllOrders(tokoId, userId);
  }

  @Post(':id/reject')
  async rejectOrder(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: RejectOrderDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };
    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService.rejectOrder(+id, tokoId, userId, dto);
  }

  @Post(':id/ship')
  async shipOrder(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() dto: ShipOrderDto,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };
    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService.shipOrder(+id, tokoId, userId, dto);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const tokoId = await this.getTokoIdFromToken(authHeader);
    
    const token = authHeader.split(' ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64').toString('utf-8'),
    ) as { id?: number; sub?: number };
    const userId = Number(decodedPayload.id ?? decodedPayload.sub);

    return this.pesananService.cancelOrder(+id, tokoId, userId);
  }
}