// Standalone Vercel Serverless Function: POST /api/cashfree/webhook
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function sanitize(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["'`]|["'`]$/g, '').replace(/\r?\n|\r/g, '').trim();
}

function getCashfreeSecretKey(): string {
  return sanitize(process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const secretKey = getCashfreeSecretKey();
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const rawBody = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(body || {});

  if (secretKey && signature && timestamp) {
    try {
      const signatureData = timestamp + rawBody;
      const expected = crypto.createHmac('sha256', secretKey).update(signatureData).digest('base64');
      if (signature !== expected) {
        console.warn('Unauthorized Cashfree Webhook: signature mismatch.');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    } catch (sigErr) {
      console.error('Webhook signature verification failure:', sigErr);
      return res.status(400).json({ error: 'Signature verification failure' });
    }
  }

  const event = body;
  const orderId = event?.data?.order?.order_id;
  const paymentStatus = event?.data?.payment?.payment_status;
  const cfPaymentId = event?.data?.payment?.cf_payment_id;

  if (!orderId) {
    return res.status(200).send('Ignored: missing orderId');
  }

  const DEFAULT_SUPABASE_URL = 'https://ijpbacailliwtthsjuqs.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YEREajXhEn6E0vWtydYjyA_nhZS43A8';
  const sbUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (sbUrl && sbKey) {
    try {
      const supabase = createClient(sbUrl, sbKey);
      const { data: existingOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();

      if (existingOrder && (existingOrder.status === 'paid' || existingOrder.status === 'confirmed')) {
        return res.status(200).json({ message: 'Order already confirmed/paid (idempotent)' });
      }

      const isCodOrder = Boolean(existingOrder?.address?.is_cod) ||
        Boolean(existingOrder?.payment_method?.includes('Cash on Delivery'));
      const isPaymentSuccess = paymentStatus === 'SUCCESS';

      if (isPaymentSuccess) {
        if (isCodOrder) {
          const advancePaid = Number(event?.data?.payment?.payment_amount || 99);
          const totalOrderAmount = Number(existingOrder?.total || existingOrder?.address?.total_order_amount || 999);
          const remainingCod = Math.max(0, totalOrderAmount - advancePaid);

          await supabase.from('orders').update({
            status: 'confirmed',
            payment_method: `Cash on Delivery (Advance Paid: ₹${advancePaid} | Due on Delivery: ₹${remainingCod} | Ref: CF-Pay: ${cfPaymentId || 'VERIFIED'})`,
            address: {
              ...(existingOrder?.address || {}),
              is_cod: true,
              advance_paid_amount: advancePaid,
              remaining_cod_amount: remainingCod,
              total_order_amount: totalOrderAmount,
              advance_status: 'paid',
              cf_payment_id: cfPaymentId,
            },
          }).eq('id', orderId);
        } else {
          await supabase.from('orders').update({
            status: 'paid',
            payment_method: `Cashfree Online (CF-Pay: ${cfPaymentId || 'VERIFIED'})`,
          }).eq('id', orderId);
        }
      }
    } catch (err) {
      console.error('Webhook processing exception:', err);
    }
  }

  return res.status(200).send('OK');
}
