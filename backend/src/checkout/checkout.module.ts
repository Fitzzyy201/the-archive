import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { MidtransWebhookController } from './midtrans-webhook.controller';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CartModule,
    PaymentModule,
    NotificationModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CheckoutController, MidtransWebhookController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}