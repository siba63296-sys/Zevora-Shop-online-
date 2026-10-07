// Standalone Vercel Serverless Function: POST /api/cashfree/create-order
import { createClient } from '@supabase/supabase-js';

function sanitize(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["'`]|["'`]$/g, '').replace(/\r?\n|\r/g, '').trim();
}

function getCashfreeConfig() {
  const appId = sanitize(process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '');
  const secretKey = sanitize(process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '');
  const rawApiVersion = sanitize(process.env.CASHFREE_API_VERSION || '2023-08-01');
  const rawEnv = (process.env.CASHFREE_ENV || 'PRODUCTION').toUpperCase().trim();

  const isVercelProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const env = isVercelProd ? 'PRODUCTION' : (rawEnv === 'SANDBOX' ? 'SANDBOX' : 'PRODUCTION');
  const baseUrl = env === 'SANDBOX' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

  return {
    appId,
    secretKey,
    apiVersion: rawApiVersion || '2023-08-01',
    env,
    baseUrl,
    isConfigured: Boolean(appId && secretKey),
  };
}

export default async function handler(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    return res.status(400).json({
      success: false,
      error: 'Cashfree credentials (CASHFREE_APP_ID and CASHFREE_SECRET_KEY) are not configured on the server.',
      missingCredentials: true,
    });
  }

  // Parse body if it arrived as string or stream
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const {
    orderId,
    orderAmount,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl,
    isCod,
    items,
    shippingAddress,
    userId,
    discountAmount,
  } = body || {};

  if (!orderId || !orderAmount) {
    return res.status(400).json({
      success: false,
      error: 'Missing required order parameters (orderId, orderAmount).',
    });
  }

  let cleanPhone = (customerPhone || '9876543210').replace(/\D/g, '');
  if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
  if (cleanPhone.length < 10) cleanPhone = '9876543210';

  const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail.trim() : 'customer@example.com';
  const cleanName = (customerName || 'Valued Customer').trim().substring(0, 100);

  const payableAmount = Number(orderAmount);
  const totalOrderAmount = Number(body?.totalOrderAmount || orderAmount);
  const advanceAmount = Math.round(payableAmount * 100) / 100;

  const payload = {
    order_id: orderId,
    order_amount: advanceAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${cleanPhone}`,
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: returnUrl,
    },
    order_note: isCod
      ? `COD Advance ₹${advanceAmount} for Order ${orderId}`
      : `Zevora Order ${orderId}`,
  };

  try {
    const cfResponse = await fetch(`${config.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await cfResponse.json();

    if (!cfResponse.ok) {
      console.error('Cashfree order creation error:', data);
      return res.status(cfResponse.status).json({
        success: false,
        error: data.message || 'Failed to create payment session with Cashfree.',
        details: data,
      });
    }

    // Attempt Supabase record if configured
    const DEFAULT_SUPABASE_URL = 'https://ijpbacailliwtthsjuqs.supabase.co';
    const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YEREajXhEn6E0vWtydYjyA_nhZS43A8';
    const sbUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    if (sbUrl && sbKey) {
      try {
        const supabase = createClient(sbUrl, sbKey);
        const orderRecord = {
          id: orderId,
          user_id: userId || null,
          total: isCod ? totalOrderAmount : advanceAmount,
          discount: Number(discountAmount) || 0,
          address: {
            ...(shippingAddress || {}),
            full_name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            is_cod: Boolean(isCod),
            advance_paid_amount: 0,
            remaining_cod_amount: isCod ? Math.max(0, totalOrderAmount - advanceAmount) : 0,
            total_order_amount: isCod ? totalOrderAmount : advanceAmount,
            cod_advance: advanceAmount,
            advance_status: 'payment_pending',
          },
          status: 'payment_pending',
          payment_method: isCod
            ? `Cash on Delivery (₹${advanceAmount} Advance Pending)`
            : `Cashfree Online (Order: ${data.cf_order_id || orderId})`,
          created_at: new Date().toISOString(),
        };
        await supabase.from('orders').upsert([orderRecord], { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('Pending order database record note:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id,
      order_id: data.order_id,
      order_status: data.order_status,
      environment: config.env,
    });
  } catch (err: any) {
    console.error('Cashfree order creation exception:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error connecting to Cashfree payment gateway.',
    });
  }
}
