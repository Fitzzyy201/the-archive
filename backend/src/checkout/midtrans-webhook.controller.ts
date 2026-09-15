import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { PaymentService } from '../payment/payment.service';

@ApiTags('Midtrans Webhook')
@Controller('midtrans/webhook')
export class MidtransWebhookController {
  private readonly logger = new Logger(MidtransWebhookController.name);

  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Midtrans notification webhook' })
  async handleWebhook(
    @Body() notification: any,
    @Headers('x-signature') signature: string,
  ) {
    this.logger.log(`Received Midtrans webhook: ${notification.order_id} - ${notification.transaction_status}`);

    try {
      const result = await this.checkoutService.handleMidtransWebhook(notification);
      return { success: true, ...result };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }
}