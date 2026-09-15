import { MidtransClient } from 'midtrans-client';

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
  channel_response_code?: string;
  channel_response_message?: string;
  card_type?: string;
  masked_card?: string;
  bank?: string;
  va_number?: string;
  expiry_time?: string;
}

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  expiry?: {
    startTime?: string;
    unit: 'minute' | 'hour' | 'day';
    duration: number;
  };
}

export const MIDTRANS_TRANSACTION_STATUS = {
  SETTLEMENT: 'settlement',
  CAPTURE: 'capture',
  PENDING: 'pending',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire',
  REFUND: 'refund',
  PARTIAL_REFUND: 'partial_refund',
} as const;

export type MidtransTransactionStatus = typeof MIDTRANS_TRANSACTION_STATUS[keyof typeof MIDTRANS_TRANSACTION_STATUS];

export function mapMidtransStatusToOrderStatus(status: string): string {
  switch (status) {
    case 'capture':
    case 'settlement':
      return 'PENDING'; // Seller masih perlu accept
    case 'pending':
      return 'PENDING';
    case 'deny':
    case 'cancel':
    case 'expire':
      return 'DIBATALKAN';
    default:
      return 'PENDING';
  }
}

export function verifySignatureKey(
  notification: MidtransNotification,
  serverKey: string,
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHash('sha512')
    .update(
      notification.order_id +
        notification.status_code +
        notification.gross_amount +
        serverKey,
    )
    .digest('hex');
  return hash === notification.signature_key;
}