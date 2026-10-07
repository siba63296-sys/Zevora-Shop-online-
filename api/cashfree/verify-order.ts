// Standalone Vercel Serverless Function: POST /api/cashfree/verify-order
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
      error: 'Cashfree credentials not configured.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const { orderId, isCod } = body || {};
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'Missing orderId parameter.' });
  }

  try {
    const orderRes = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
      },
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      return res.status(orderRes.status).json({
        success: false,
        error: orderData.message || 'Could not verify order with Cashfree.',
      });
    }

    let paymentDetails: any = null;
    let isPaid = orderData.order_status === 'PAID';

    try {
      const payRes = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
        headers: {
          'x-client-id': config.appId,
          'x-client-secret': config.secretKey,
          'x-api-version': config.apiVersion,
        },
      });
      const payments = await payRes.json();
      if (Array.isArray(payments) && payments.length > 0) {
        const successful = payments.find((p: any) => p.payment_status === 'SUCCESS');
        if (successful) {
          isPaid = true;
          paymentDetails = successful;
        } else {
          paymentDetails = payments[0];
        }
      }
    } catch (payErr) {
      console.warn('Could not fetch individual payments list:', payErr);
    }

    const DEFAULT_SUPABASE_URL = 'https://ijpbacailliwtthsjuqs.supabase.co';
    const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YEREajXhEn6E0vWtydYjyA_nhZS43A8';
    const sbUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    let existingOrder: any = null;

    if (sbUrl && sbKey) {
      try {
        const supabase = createClient(sbUrl, sbKey);
        const { data: dbOrd } = await supabase.from('orders').select('*').eq('id', orderId).single();
        existingOrder = dbOrd;

        const isCodOrder = Boolean(isCod) ||
          Boolean(existingOrder?.address?.is_cod) ||
          Boolean(existingOrder?.payment_method?.includes('Cash on Delivery'));

        const cfPaymentId = paymentDetails?.cf_payment_id || '';
        const cfOrderId = orderData.cf_order_id || '';
        const advancePaid = Number(orderData.order_amount) || 99;
        const totalOrderAmount = Number(existingOrder?.total || existingOrder?.address?.total_order_amount || orderData.order_amount);
        const remainingCod = isCodOrder ? Math.max(0, totalOrderAmount - advancePaid) : 0;

        let targetStatus = 'payment_pending';
        if (isPaid) {
          targetStatus = isCodOrder ? 'confirmed' : 'paid';
        } else if (orderData.order_status === 'EXPIRED' || orderData.order_status === 'CANCELLED') {
          targetStatus = 'cancelled';
        } else if (paymentDetails?.payment_status === 'FAILED' || orderData.order_status === 'FAILED') {
          targetStatus = 'failed';
        }

        const updatePayload: any = { status: targetStatus };
        if (isCodOrder && isPaid) {
          updatePayload.payment_method = `Cash on Delivery (Advance Paid: ₹${advancePaid} | Due on Delivery: ₹${remainingCod} | Ref: CF-Pay: ${cfPaymentId || 'VERIFIED'})`;
          updatePayload.address = {
            ...(existingOrder?.address || {}),
            is_cod: true,
            advance_paid_amount: advancePaid,
            remaining_cod_amount: remainingCod,
            total_order_amount: totalOrderAmount,
            advance_status: 'paid',
            cf_payment_id: cfPaymentId,
            cf_order_id: cfOrderId,
          };
        } else if (!isCodOrder && isPaid) {
          updatePayload.payment_method = `Cashfree Online (CF-Pay: ${cfPaymentId || 'VERIFIED'})`;
        }

        await supabase.from('orders').update(updatePayload).eq('id', orderId);
      } catch (dbErr) {
        console.warn('Error updating order in Supabase:', dbErr);
      }
    }

    const isCodOrder = Boolean(isCod) || Boolean(existingOrder?.address?.is_cod);
    const advancePaid = Number(orderData.order_amount) || 99;
    const totalOrderAmount = Number(existingOrder?.total || orderData.order_amount);
    const remainingCod = isCodOrder ? Math.max(0, totalOrderAmount - advancePaid) : 0;

    return res.status(200).json({
      success: true,
      isPaid,
      isCod: isCodOrder,
      advancePaid: isCodOrder ? advancePaid : 0,
      remainingCod: isCodOrder ? remainingCod : 0,
      totalOrderAmount: isCodOrder ? totalOrderAmount : Number(orderData.order_amount),
      order_status: orderData.order_status,
      order_amount: orderData.order_amount,
      cf_order_id: orderData.cf_order_id,
      payment: paymentDetails,
    });
  } catch (err: any) {
    console.error('Error verifying order with Cashfree:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error verifying payment status.',
    });
  }
}
