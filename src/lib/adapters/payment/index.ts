export interface PaymentHoldResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'AUTHORIZED' | 'FAILED';
  message: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId: string;
  sitterId: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'FAILED';
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  bookingId: string;
  refundAmount: number;
  reason: string;
}

export interface IPaymentProvider {
  createHold(bookingId: string, amount: number): Promise<PaymentHoldResult>;
  captureHold(bookingId: string, transactionId: string): Promise<{ success: boolean }>;
  processRefund(bookingId: string, amount: number, reason: string): Promise<RefundResult>;
  payoutSitter(sitterId: string, amount: number): Promise<PayoutResult>;
}

export class LocalMockPaymentAdapter implements IPaymentProvider {
  async createHold(bookingId: string, amount: number): Promise<PaymentHoldResult> {
    // Simulates instant CAD payment authorization hold via Stripe Connect
    return {
      success: true,
      transactionId: `mock_hold_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      currency: 'CAD',
      status: 'AUTHORIZED',
      message: `Simulated hold of $${amount.toFixed(2)} CAD captured for booking ${bookingId}`,
    };
  }

  async captureHold(bookingId: string, transactionId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async processRefund(bookingId: string, amount: number, reason: string): Promise<RefundResult> {
    return {
      success: true,
      refundId: `mock_refund_${Math.random().toString(36).substring(2, 9)}`,
      bookingId,
      refundAmount: amount,
      reason,
    };
  }

  async payoutSitter(sitterId: string, amount: number): Promise<PayoutResult> {
    return {
      success: true,
      payoutId: `mock_payout_${Math.random().toString(36).substring(2, 9)}`,
      sitterId,
      amount,
      currency: 'CAD',
      status: 'PAID',
    };
  }
}

export const paymentProvider = new LocalMockPaymentAdapter();
