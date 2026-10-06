// Client helper for Cashfree Payment Gateway (communicates exclusively with backend proxy /api/cashfree/*)

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'production' | 'sandbox' }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_modal' | '_blank';
      }) => Promise<any>;
    };
  }
}

export interface CashfreeConfigStatus {
  configured: boolean;
  environment: 'PRODUCTION' | 'SANDBOX';
  appIdConfigured: boolean;
  appIdPrefix: string | null;
  secretConfigured: boolean;
}

export async function getCashfreeConfigStatus(): Promise<CashfreeConfigStatus> {
  try {
    const res = await fetch('/api/cashfree/config-status');
    if (!res.ok) {
      return {
        configured: false,
        environment: 'PRODUCTION',
        appIdConfigured: false,
        appIdPrefix: null,
        secretConfigured: false,
      };
    }
    return await res.json();
  } catch {
    return {
      configured: false,
      environment: 'PRODUCTION',
      appIdConfigured: false,
      appIdPrefix: null,
      secretConfigured: false,
    };
  }
}

export async function createCashfreeOrderSession(params: {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  userId?: string | null;
  discountAmount?: number;
  shippingAddress?: any;
  paymentMethod?: string;
  items?: any[];
  isCod?: boolean;
  totalOrderAmount?: number;
  remainingCodAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
}): Promise<{
  success: boolean;
  payment_session_id?: string;
  cf_order_id?: string;
  order_id?: string;
  order_status?: string;
  environment?: 'PRODUCTION' | 'SANDBOX';
  error?: string;
  missingCredentials?: boolean;
}> {
  try {
    const res = await fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error connecting to payment gateway server.',
    };
  }
}

export async function launchCashfreeCheckout(
  paymentSessionId: string,
  environment: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION'
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !window.Cashfree) {
    // If Cashfree script is still loading, wait a moment
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (!window.Cashfree) {
    return {
      success: false,
      error: 'Cashfree SDK script failed to load in browser. Please check your network connection.',
    };
  }

  try {
    const mode = environment.toLowerCase() === 'sandbox' ? 'sandbox' : 'production';
    const cashfree = window.Cashfree({ mode });
    await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_self',
    });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to initiate Cashfree checkout window.',
    };
  }
}

export async function verifyCashfreePayment(orderId: string, isCod?: boolean): Promise<{
  success: boolean;
  isPaid: boolean;
  isCod?: boolean;
  advancePaid?: number;
  remainingCod?: number;
  totalOrderAmount?: number;
  order_status?: string;
  order_amount?: number;
  cf_order_id?: string;
  payment?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/cashfree/verify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, isCod }),
    });

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      isPaid: false,
      error: err?.message || 'Failed to verify payment status with server.',
    };
  }
}
