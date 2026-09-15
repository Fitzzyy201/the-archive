import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Snap } from 'midtrans-client';
import {
  MidtransSnapResponse,
  MidtransNotification,
  CreateSnapTransactionParams,
  MIDTRANS_TRANSACTION_STATUS,
  verifySignatureKey,
  mapMidtransStatusToOrderStatus,
} from './payment.interface';

@Injectable()
export class PaymentService {
  private snap: Snap;

  constructor(private readonly configService: ConfigService) {
    this.snap = new Snap({
      isProduction: this.configService.get('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get('MIDTRANS_SERVER_KEY') || '',
      clientKey: this.configService.get('MIDTRANS_CLIENT_KEY') || '',
    });
  }

  async createSnapTransaction(params: CreateSnapTransactionParams): Promise<MidtransSnapResponse> {
    try {
      const parameter = {
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        item_details: params.itemDetails,
        customer_details: params.customerDetails,
        callbacks: params.callbacks || {},
        expiry: params.expiry || {
          unit: 'minute',
          duration: 15,
        },
      };

      const response = await this.snap.createTransaction(parameter);
      return {
        token: response.token,
        redirect_url: response.redirect_url,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal membuat transaksi Midtrans: ${error.message}`);
    }
  }

  async getTransactionStatus(orderId: string) {
    try {
      const response = await this.snap.transaction.status(orderId);
      return response;
    } catch (error) {
      throw new BadRequestException(`Gagal mengambil status transaksi: ${error.message}`);
    }
  }

  verifyWebhookSignature(notification: MidtransNotification): boolean {
    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY') || '';
    return verifySignatureKey(notification, serverKey);
  }

  parseNotification(notification: MidtransNotification) {
    return {
      orderId: notification.order_id,
      transactionId: notification.transaction_id,
      status: notification.transaction_status,
      paymentType: notification.payment_type,
      grossAmount: parseInt(notification.gross_amount, 10),
      fraudStatus: notification.fraud_status,
      vaNumber: notification.va_number,
      expiryTime: notification.expiry_time ? new Date(notification.expiry_time) : null,
      settlementTime: notification.settlement_time ? new Date(notification.settlement_time) : null,
      rawNotification: notification,
    };
  }

  mapStatusToOrderStatus(midtransStatus: string): string {
    return mapMidtransStatusToOrderStatus(midtransStatus);
  }

  isSuccessfulPayment(status: string): boolean {
    return [MIDTRANS_TRANSACTION_STATUS.SETTLEMENT, MIDTRANS_TRANSACTION_STATUS.CAPTURE].includes(
      status as any,
    );
  }

  isFailedPayment(status: string): boolean {
    return [MIDTRANS_TRANSACTION_STATUS.DENY, MIDTRANS_TRANSACTION_STATUS.CANCEL, MIDTRANS_TRANSACTION_STATUS.EXPIRE].includes(
      status as any,
    );
  }
}