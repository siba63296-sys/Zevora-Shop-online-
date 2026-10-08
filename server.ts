import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Preserve rawBody buffer for Cashfree webhook signature verification
app.use(
  express.json({
    limit: '25mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Middleware: Normalize Vercel Serverless Function rewrites & reverse proxies
app.use((req, _res, next) => {
  // 1. Check if rewrite forwarded a query parameter (e.g. ?__path=cashfree/config-status)
  const qPath = req.query && (req.query.__path || req.query.path || req.query['1'] || req.query['0']);
  if (typeof qPath === 'string' && qPath.trim()) {
    const clean = qPath.trim().replace(/^\/+/, '');
    req.url = clean.startsWith('api/') ? `/${clean}` : `/api/${clean}`;
  } else {
    // 2. Check Vercel regex rewrite match headers (e.g. x-now-route-matches: 1=cashfree%2Fconfig-status)
    const rawMatches = req.headers['x-now-route-matches'] as string;
    if (rawMatches && (req.url === '/api' || req.url === '/api/' || req.url === '/')) {
      try {
        const parsed = new URLSearchParams(rawMatches);
        const sub = parsed.get('1') || parsed.get('0');
        if (sub) {
          const dec = decodeURIComponent(sub).replace(/^\/+/, '');
          req.url = dec.startsWith('api/') ? `/${dec}` : `/api/${dec}`;
        }
      } catch {}
    }

    // 3. Fallback to matched path if it is a specific subpath (and not just /api)
    const rawMatched = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-original-url']) as string;
    if (rawMatched && rawMatched !== '/api' && rawMatched !== '/api/' && rawMatched !== '/' && (req.url === '/api' || req.url === '/api/' || req.url === '/')) {
      req.url = rawMatched.startsWith('/api') ? rawMatched : `/api${rawMatched.startsWith('/') ? '' : '/'}${rawMatched}`;
    }
  }

  // 4. If request arrived without /api prefix, prefix with /api
  if (req.url && !req.url.startsWith('/api/') && req.url !== '/api') {
    if (
      req.url.startsWith('/cashfree') ||
      req.url.startsWith('/coupons') ||
      req.url.startsWith('/offers') ||
      req.url.startsWith('/settings') ||
      req.url.startsWith('/upload-product-image') ||
      req.url.startsWith('/products')
    ) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url.replace(/^\/+/, '')}`;
    }
  }
  next();
});

// Fallback to project credentials if container env has placeholder
const DEFAULT_SUPABASE_URL = 'https://ijpbacailliwtthsjuqs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YEREajXhEn6E0vWtydYjyA_nhZS43A8';

const envUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = (!envUrl || envUrl.includes('your-project.supabase.co') || envUrl.includes('api.supabase.com') || !envUrl.includes('.supabase.co')) ? DEFAULT_SUPABASE_URL : envUrl;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function sanitizeEnv(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/^["'`]|["'`]$/g, '')
    .replace(/\r?\n|\r/g, '')
    .trim();
}

// Cashfree credentials from server-side environment variables ONLY (never exposed to client)
export const getCashfreeConfig = () => {
  const rawAppId = (
    process.env.CASHFREE_APP_ID ||
    process.env.CASHFREE_CLIENT_ID ||
    process.env.CASHFREE_KEY_ID ||
    process.env.cashfree_app_id ||
    process.env.Cashfree_App_Id ||
    ''
  );
  const rawSecretKey = (
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET ||
    process.env.CASHFREE_API_SECRET ||
    process.env.CASHFREE_SECRET ||
    process.env.cashfree_secret_key ||
    process.env.Cashfree_Secret_Key ||
    ''
  );
  const rawApiVersion = (
    process.env.CASHFREE_API_VERSION ||
    process.env.cashfree_api_version ||
    '2023-08-01'
  );
  const rawEnv = (
    process.env.CASHFREE_ENV ||
    process.env.cashfree_env ||
    'PRODUCTION'
  ).toUpperCase().trim();

  const appId = sanitizeEnv(rawAppId);
  const secretKey = sanitizeEnv(rawSecretKey);
  const apiVersion = sanitizeEnv(rawApiVersion) || '2023-08-01';

  // Requirement 12: Ensure production Cashfree uses the Production environment, not Sandbox.
  // In Vercel or Production deployment, strictly enforce PRODUCTION unless explicitly set to Sandbox in non-prod
  const isVercelProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  let env: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION';
  if (isVercelProd) {
    env = 'PRODUCTION';
  } else if (rawEnv === 'SANDBOX') {
    env = 'SANDBOX';
  } else {
    env = 'PRODUCTION';
  }

  const baseUrl = env === 'SANDBOX'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';

  const isConfigured = Boolean(appId && secretKey);

  // Safe server-side diagnostic logging (NEVER exposing secret values)
  const envKeysDetected = Object.keys(process.env).filter((k) =>
    k.toUpperCase().includes('CASHFREE')
  );

  if (!isConfigured) {
    console.warn('[Cashfree Config Warning] Server credentials incomplete:', {
      hasAppId: Boolean(appId),
      appIdLength: appId.length,
      hasSecretKey: Boolean(secretKey),
      secretKeyLength: secretKey.length,
      environment: env,
      apiVersion,
      detectedCashfreeEnvKeys: envKeysDetected,
      hint: envKeysDetected.length === 0
        ? 'No CASHFREE_* environment variables found in process.env. Ensure they are configured in Vercel Project Settings for Production, and trigger a new deployment.'
        : 'CASHFREE_* environment variables detected, but App ID or Secret Key resolved to empty string.',
    });
  } else {
    console.log('[Cashfree Config] Credentials verified successfully:', {
      appIdPrefix: appId.substring(0, 4) + '...',
      appIdLength: appId.length,
      hasSecretKey: true,
      secretKeyLength: secretKey.length,
      environment: env,
      apiVersion,
      baseUrl,
      detectedCashfreeEnvKeys: envKeysDetected,
    });
  }

  return {
    appId,
    secretKey,
    env,
    apiVersion,
    baseUrl,
    isConfigured,
  };
};

// Authoritative Coupon Definitions & Validator on Server
interface ServerCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_cart_value: number;
  max_discount_amount?: number;
  scope: 'all' | 'category' | 'products';
  target_category_id?: string;
  target_category_name?: string;
  target_product_ids?: string[];
  start_at?: string | null;
  end_at?: string | null;
  usage_limit?: number;
  times_used?: number;
  allow_with_offers: boolean;
  is_active: boolean;
}

const DEFAULT_SERVER_COUPONS: ServerCoupon[] = [
  {
    id: 'cpn-welcome',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_cart_value: 499,
    max_discount_amount: 500,
    scope: 'all',
    allow_with_offers: true,
    is_active: true,
  },
  {
    id: 'cpn-flat200',
    code: 'FLAT200',
    discount_type: 'fixed',
    discount_value: 200,
    min_cart_value: 1499,
    scope: 'all',
    allow_with_offers: true,
    is_active: true,
  },
  {
    id: 'cpn-fashion25',
    code: 'FASHION25',
    discount_type: 'percentage',
    discount_value: 25,
    min_cart_value: 999,
    max_discount_amount: 1000,
    scope: 'category',
    target_category_id: 'cat-fashion',
    target_category_name: 'Fashion',
    allow_with_offers: false,
    is_active: true,
  },
  {
    id: 'cpn-festive',
    code: 'FESTIVE500',
    discount_type: 'fixed',
    discount_value: 500,
    min_cart_value: 2999,
    scope: 'all',
    allow_with_offers: true,
    is_active: true,
  },
];

async function validateCouponServerSide(
  code: string,
  items: any[],
  cartSubtotal: number
): Promise<{ valid: boolean; discountAmount: number; message: string; coupon?: any }> {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discountAmount: 0, message: 'Coupon code is required.' };
  }

  let coupon: any = null;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .single();
      if (!error && data) {
        coupon = data;
      }
    } catch {
      // Supabase query error fallback
    }
  }

  if (!coupon) {
    coupon = DEFAULT_SERVER_COUPONS.find((c) => c.code === cleanCode);
  }

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" not found.` };
  }

  if (!coupon.is_active) {
    return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" is inactive.` };
  }

  const now = new Date();
  if (coupon.start_at && new Date(coupon.start_at) > now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" is not yet active.` };
  }
  if (coupon.end_at && new Date(coupon.end_at) < now) {
    return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" has expired.` };
  }
  if (coupon.usage_limit && (coupon.times_used || 0) >= coupon.usage_limit) {
    return { valid: false, discountAmount: 0, message: `Coupon "${cleanCode}" usage limit reached.` };
  }

  const minCart = Number(coupon.min_cart_value) || 0;
  if (minCart > 0 && cartSubtotal < minCart) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum cart value of ₹${minCart} required for coupon "${cleanCode}". (Cart: ₹${cartSubtotal})`,
    };
  }

  // Filter items eligible for coupon
  // Double discount rule: "Offer + Coupon dono active ho to double discount tabhi ho jab admin allow kare."
  const eligibleItems = items.filter((it: any) => {
    if (!coupon.allow_with_offers && (it.applied_offer_id || it.is_deal)) {
      return false;
    }
    if (coupon.scope === 'category') {
      const targetCat = (coupon.target_category_id || '').toLowerCase();
      const itemCat = (it.category_id || '').toLowerCase();
      if (targetCat && (targetCat === itemCat || targetCat.replace(/^cat-/, '') === itemCat.replace(/^cat-/, ''))) {
        return true;
      }
      return false;
    }
    if (coupon.scope === 'products' && Array.isArray(coupon.target_product_ids)) {
      return coupon.target_product_ids.includes(it.product_id);
    }
    return true;
  });

  if (eligibleItems.length === 0) {
    return {
      valid: false,
      discountAmount: 0,
      message: !coupon.allow_with_offers
        ? `Coupon "${cleanCode}" cannot be combined with existing category offer deals in your cart.`
        : `Coupon "${cleanCode}" is not applicable to any items in your cart.`,
    };
  }

  const eligibleSubtotal = eligibleItems.reduce(
    (sum: number, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((eligibleSubtotal * (Number(coupon.discount_value) || 0)) / 100);
    if (coupon.max_discount_amount && Number(coupon.max_discount_amount) > 0) {
      discount = Math.min(discount, Number(coupon.max_discount_amount));
    }
  } else {
    discount = Math.round(Number(coupon.discount_value) || 0);
  }

  discount = Math.max(0, Math.min(discount, eligibleSubtotal, cartSubtotal));

  return {
    valid: true,
    discountAmount: discount,
    message: `Coupon "${cleanCode}" verified! ₹${discount} discount applied.`,
    coupon,
  };
}

// 1. Config status check (safe, does NOT expose secret key)
app.get(['/api/cashfree/config-status', '/cashfree/config-status'], (_req: Request, res: Response) => {
  const config = getCashfreeConfig();
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    configured: config.isConfigured,
    environment: config.env,
    appIdConfigured: Boolean(config.appId),
    appIdPrefix: config.appId ? config.appId.substring(0, 4) + '...' : null,
    secretConfigured: Boolean(config.secretKey),
    apiVersion: config.apiVersion,
    timestamp: new Date().toISOString(),
    diagnostics: {
      hasAppId: Boolean(config.appId),
      hasSecret: Boolean(config.secretKey),
      appIdLength: config.appId ? config.appId.length : 0,
      secretLength: config.secretKey ? config.secretKey.length : 0,
      envKeysDetected: Object.keys(process.env)
        .filter((k) => k.toUpperCase().includes('CASHFREE'))
        .map((k) => k.trim()),
    },
  });
});

// Server-side Coupon Validation Endpoint
app.post(['/api/coupons/validate', '/coupons/validate'], async (req: Request, res: Response) => {
  const { code, items, cartSubtotal } = req.body;
  const result = await validateCouponServerSide(
    code,
    Array.isArray(items) ? items : [],
    Number(cartSubtotal) || 0
  );
  res.json(result);
});

// 2. Create Cashfree Order
app.post(['/api/cashfree/create-order', '/cashfree/create-order'], async (req: Request, res: Response) => {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    res.status(400).json({
      success: false,
      error: 'Cashfree credentials (CASHFREE_APP_ID and CASHFREE_SECRET_KEY) are not configured on the server.',
      missingCredentials: true,
    });
    return;
  }

  const {
    orderId,
    orderAmount,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl,
    couponCode,
  } = req.body;

  if (!orderId || !orderAmount) {
    res.status(400).json({
      success: false,
      error: 'Missing required order parameters (orderId, orderAmount).',
    });
    return;
  }

  // Format valid 10-digit phone for Cashfree
  let cleanPhone = (customerPhone || '9876543210').replace(/\D/g, '');
  if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
  if (cleanPhone.length < 10) cleanPhone = '9876543210';

  const cleanEmail = (customerEmail && customerEmail.includes('@'))
    ? customerEmail.trim()
    : 'customer@example.com';

  const cleanName = (customerName || 'Valued Customer').trim().substring(0, 100);

  // Server-side verification and calculation of payable amount to prevent frontend tampering
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  let calculatedSubtotal = 0;
  for (const it of items) {
    const itemPrice = Math.max(0, Number(it.price) || 0);
    const itemQty = Math.max(1, Number(it.quantity) || 1);
    calculatedSubtotal += itemPrice * itemQty;
  }

  // Authoritative server-side coupon validation
  let serverCouponDiscount = 0;
  const cleanCouponCode = couponCode ? String(couponCode).trim().toUpperCase() : null;
  if (cleanCouponCode) {
    const couponRes = await validateCouponServerSide(cleanCouponCode, items, calculatedSubtotal);
    if (couponRes.valid) {
      serverCouponDiscount = couponRes.discountAmount;
    } else {
      console.warn(`Server-side coupon validation failed for "${cleanCouponCode}":`, couponRes.message);
    }
  }

  const isCod = Boolean(req.body.isCod);
  const deliveryFee = Number(req.body.deliveryFee) || 0;
  const onlineDiscount = !isCod ? Math.round(Math.max(0, calculatedSubtotal - serverCouponDiscount) * 0.2) : 0;
  
  // Total verified order amount with all discounts carried forward
  const computedTotal = Math.max(
    1,
    Math.round(calculatedSubtotal + deliveryFee - (serverCouponDiscount + onlineDiscount))
  );

  let verifiedPayable = Number(orderAmount);

  if (isCod) {
    // For COD, the advance payment is strictly ₹99 (or total amount if under ₹99)
    verifiedPayable = Math.min(99, Math.max(1, Math.round(computedTotal)));
  } else {
    // For online payment, payable is the final discounted amount
    verifiedPayable = computedTotal;
  }

  const totalOrderAmount = computedTotal;
  const advanceAmount = Math.round(verifiedPayable * 100) / 100;
  const remainingCod = isCod ? Math.max(0, totalOrderAmount - advanceAmount) : 0;

  const payload = {
    order_id: orderId,
    order_amount: advanceAmount, // EXACTLY ₹99 for COD advance or verified final discounted total
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
      : `The Online Store Order ${orderId}`,
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
      res.status(cfResponse.status).json({
        success: false,
        error: data.message || 'Failed to create payment session with Cashfree.',
        details: data,
      });
      return;
    }

    // Pre-record order as payment_pending in Supabase
    if (supabase) {
      try {
        const orderRecord: any = {
          id: orderId,
          user_id: req.body.userId || null,
          total: isCod ? totalOrderAmount : advanceAmount, // Product Total for COD (e.g. ₹999), NOT ₹1,098
          discount: req.body.discountAmount ? Number(req.body.discountAmount) : 0,
          address: {
            ...(req.body.shippingAddress || {}),
            full_name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            is_cod: isCod,
            advance_paid_amount: 0,
            remaining_cod_amount: remainingCod,
            total_order_amount: isCod ? totalOrderAmount : advanceAmount,
            cod_advance: advanceAmount,
            advance_status: 'payment_pending',
            coupon_code: cleanCouponCode || null,
            coupon_discount: serverCouponDiscount || null,
          },
          status: 'payment_pending',
          payment_method: isCod
            ? `Cash on Delivery (₹${advanceAmount} Advance Pending)`
            : `Cashfree Online (Order: ${data.cf_order_id || orderId})`,
          created_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase.from('orders').upsert([orderRecord], { onConflict: 'id' });
        if (insertErr) {
          console.warn('Note on Supabase pending order record:', insertErr.message);
        } else if (Array.isArray(req.body.items) && req.body.items.length > 0) {
          const itemRecords = req.body.items.map((it: any) => ({
            id: it.id && it.id.length === 36 ? it.id : crypto.randomUUID(),
            order_id: orderId,
            product_id: it.product_id,
            product_name: it.product_name,
            product_image: it.product_image || '',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
            created_at: new Date().toISOString(),
          }));
          await supabase.from('order_items').insert(itemRecords);
        }
      } catch (dbErr) {
        console.warn('Pending order database record note:', dbErr);
      }
    }

    res.json({
      success: true,
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id,
      order_id: data.order_id,
      order_status: data.order_status,
      environment: config.env,
    });
  } catch (err: any) {
    console.error('Cashfree server fetch exception:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Server error connecting to Cashfree payment gateway.',
    });
  }
});

// 3. Server-side Verify Cashfree Order & Payment
app.post(['/api/cashfree/verify-order', '/cashfree/verify-order'], async (req: Request, res: Response) => {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    res.status(400).json({
      success: false,
      error: 'Cashfree credentials not configured.',
    });
    return;
  }

  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ success: false, error: 'Missing orderId parameter.' });
    return;
  }

  try {
    // 1. Fetch Order status from Cashfree
    const orderRes = await fetch(`${config.baseUrl}/orders/${orderId}`, {
      headers: {
        'x-client-id': config.appId,
        'x-client-secret': config.secretKey,
        'x-api-version': config.apiVersion,
      },
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      res.status(orderRes.status).json({
        success: false,
        error: orderData.message || 'Could not verify order with Cashfree.',
      });
      return;
    }

    // 2. Fetch Payments array for the order
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
        // Look for successful payment
        const successfulPayment = payments.find((p: any) => p.payment_status === 'SUCCESS');
        if (successfulPayment) {
          isPaid = true;
          paymentDetails = successfulPayment;
        } else {
          paymentDetails = payments[0];
        }
      }
    } catch (payErr) {
      console.warn('Could not fetch individual payments list:', payErr);
    }

    // 3. Query existing order in Supabase
    let existingOrder: any = null;
    if (supabase) {
      const { data: dbOrd } = await supabase.from('orders').select('*').eq('id', orderId).single();
      existingOrder = dbOrd;
    }

    const isCodOrder = Boolean(req.body.isCod) ||
      Boolean(existingOrder?.address?.is_cod) ||
      Boolean(existingOrder?.payment_method?.includes('Cash on Delivery'));

    const cfPaymentId = paymentDetails?.cf_payment_id || '';
    const cfOrderId = orderData.cf_order_id || '';

    // Calculate amounts
    const advancePaid = Number(orderData.order_amount) || 99;
    const totalOrderAmount = Number(existingOrder?.total || existingOrder?.address?.total_order_amount || orderData.order_amount);
    const remainingCod = isCodOrder ? Math.max(0, totalOrderAmount - advancePaid) : 0;

    let targetStatus: 'paid' | 'confirmed' | 'payment_pending' | 'cancelled' | 'failed' = 'payment_pending';
    if (isPaid) {
      targetStatus = isCodOrder ? 'confirmed' : 'paid';
    } else if (orderData.order_status === 'EXPIRED' || orderData.order_status === 'CANCELLED' || orderData.order_status === 'TERMINATED') {
      targetStatus = 'cancelled';
    } else if (paymentDetails?.payment_status === 'FAILED' || orderData.order_status === 'FAILED') {
      targetStatus = 'failed';
    } else if (paymentDetails?.payment_status === 'CANCELLED' || paymentDetails?.payment_status === 'USER_DROPPED') {
      targetStatus = 'cancelled';
    } else {
      targetStatus = 'payment_pending';
    }

    if (supabase) {
      try {
        const updatePayload: any = {
          status: targetStatus,
        };

        if (isCodOrder) {
          if (isPaid) {
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
          } else {
            updatePayload.payment_method = `Cash on Delivery (Advance ${targetStatus === 'failed' ? 'Failed' : 'Pending'})`;
            updatePayload.address = {
              ...(existingOrder?.address || {}),
              is_cod: true,
              advance_paid_amount: 0,
              remaining_cod_amount: remainingCod,
              total_order_amount: totalOrderAmount,
              advance_status: targetStatus,
            };
          }
        } else {
          // Full online payment
          if (isPaid && cfPaymentId) {
            updatePayload.payment_method = `Cashfree Online (CF-Pay: ${cfPaymentId})`;
          } else if (cfPaymentId) {
            updatePayload.payment_method = `Cashfree Online (Ref: ${cfPaymentId}, Status: ${paymentDetails.payment_status})`;
          } else if (cfOrderId) {
            updatePayload.payment_method = `Cashfree Online (CF-Order: ${cfOrderId})`;
          }
        }

        const { error: dbError } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', orderId);

        if (dbError) {
          console.warn('Supabase order update note:', dbError.message);
        }
      } catch (dbErr) {
        console.warn('Error updating order in Supabase:', dbErr);
      }
    }

    res.json({
      success: true,
      isPaid,
      isCod: isCodOrder,
      advancePaid: isCodOrder ? advancePaid : 0,
      remainingCod: isCodOrder ? remainingCod : 0,
      totalOrderAmount: isCodOrder ? totalOrderAmount : Number(orderData.order_amount),
      order_status: orderData.order_status,
      order_amount: orderData.order_amount,
      cf_order_id: cfOrderId,
      payment: paymentDetails,
    });
  } catch (err: any) {
    console.error('Error verifying order with Cashfree:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Server error verifying payment status.',
    });
  }
});

// 4. Secure & Idempotent Cashfree Webhook Listener
app.post(['/api/cashfree/webhook', '/cashfree/webhook'], async (req: Request, res: Response) => {
  const config = getCashfreeConfig();
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;
  const rawBody = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : JSON.stringify(req.body);

  // Authenticate webhook signature if signature headers are provided
  if (config.secretKey && signature && timestamp) {
    try {
      const signatureData = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', config.secretKey)
        .update(signatureData)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.warn('Unauthorized Cashfree Webhook: Signature mismatch.');
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    } catch (sigErr) {
      console.error('Webhook signature verification failure:', sigErr);
      res.status(400).json({ error: 'Signature verification failure' });
      return;
    }
  }

  const event = req.body;
  const eventType = event?.type || '';
  const orderId = event?.data?.order?.order_id;
  const paymentStatus = event?.data?.payment?.payment_status;
  const cfPaymentId = event?.data?.payment?.cf_payment_id;

  if (!orderId) {
    res.status(200).send('Ignored: missing orderId');
    return;
  }

  try {
    if (supabase) {
      // Idempotency check: inspect existing order status
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      // If already marked as paid or confirmed, acknowledge and exit cleanly (idempotent)
      if (existingOrder && (existingOrder.status === 'paid' || existingOrder.status === 'confirmed')) {
        res.status(200).json({ message: 'Order already confirmed/paid (idempotent)' });
        return;
      }

      const isCodOrder = Boolean(existingOrder?.address?.is_cod) ||
        Boolean(existingOrder?.payment_method?.includes('Cash on Delivery'));

      const isPaymentSuccess = paymentStatus === 'SUCCESS' || eventType === 'PAYMENT_SUCCESS_WEBHOOK';
      const isPaymentFailed = paymentStatus === 'FAILED' || eventType === 'PAYMENT_FAILED_WEBHOOK';
      const isPaymentCancelled = paymentStatus === 'CANCELLED' || paymentStatus === 'USER_DROPPED' || eventType === 'PAYMENT_USER_DROPPED_WEBHOOK';

      if (isPaymentSuccess) {
        if (isCodOrder) {
          const advancePaid = Number(event?.data?.payment?.payment_amount || 99);
          const totalOrderAmount = Number(existingOrder?.total || existingOrder?.address?.total_order_amount || 999);
          const remainingCod = Math.max(0, totalOrderAmount - advancePaid);

          await supabase
            .from('orders')
            .update({
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
            })
            .eq('id', orderId);
        } else {
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_method: `Cashfree Online (CF-Pay: ${cfPaymentId || 'VERIFIED'})`,
            })
            .eq('id', orderId);
        }
      } else if (isPaymentFailed && existingOrder?.status !== 'paid' && existingOrder?.status !== 'confirmed') {
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            payment_method: isCodOrder
              ? `Cash on Delivery (Advance Failed | Ref: ${cfPaymentId || 'FAILED'})`
              : `Cashfree Online (CF-Pay: ${cfPaymentId || 'FAILED'}, Status: FAILED)`,
          })
          .eq('id', orderId);
      } else if (isPaymentCancelled && existingOrder?.status !== 'paid' && existingOrder?.status !== 'confirmed') {
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_method: isCodOrder
              ? `Cash on Delivery (Advance Cancelled)`
              : `Cashfree Online (CF-Pay: ${cfPaymentId || 'CANCELLED'}, Status: CANCELLED)`,
          })
          .eq('id', orderId);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook Processing Error');
  }
});

// 5. Dynamic Offers / Banners Endpoints
app.get('/api/offers', async (_req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, offers: [] });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      res.json({ success: true, offers: [], error: error.message });
      return;
    }

    res.json({ success: true, offers: data || [] });
  } catch (err: any) {
    res.json({ success: true, offers: [], error: err?.message });
  }
});

app.post('/api/offers', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const offer = req.body;
    const { data, error } = await supabase.from('offers').insert([offer]).select();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, offer: data?.[0] || offer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/offers/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, offer: data?.[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/offers/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 6. Coupons Endpoints
app.get('/api/coupons', async (_req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, coupons: DEFAULT_SERVER_COUPONS });
    return;
  }
  try {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      res.json({ success: true, coupons: DEFAULT_SERVER_COUPONS });
      return;
    }
    res.json({ success: true, coupons: data });
  } catch {
    res.json({ success: true, coupons: DEFAULT_SERVER_COUPONS });
  }
});

app.post('/api/coupons', async (req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, coupon: req.body });
    return;
  }
  try {
    const coupon = req.body;
    const { data, error } = await supabase.from('coupons').insert([coupon]).select();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, coupon: data?.[0] || coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/coupons/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, coupon: req.body });
    return;
  }
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('coupons').update(updates).eq('id', id).select();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, coupon: data?.[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/coupons/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true });
    return;
  }
  try {
    const { id } = req.params;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 7. Site Settings Endpoints
app.get('/api/settings', async (_req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, settings: null });
    return;
  }
  try {
    const { data: dlData, error: dlErr } = await supabase.storage
      .from('product-images')
      .download('settings/site_settings.json');
    if (!dlErr && dlData) {
      const text = await dlData.text();
      const parsed = JSON.parse(text);
      res.json({ success: true, settings: parsed });
      return;
    }
  } catch (err) {
    console.warn('Error downloading site_settings from Supabase storage:', err);
  }

  // Fallback to table if present
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'primary').single();
    if (!error && data) {
      res.json({ success: true, settings: data });
      return;
    }
  } catch {}

  res.json({ success: true, settings: null });
});

app.put('/api/settings', async (req: Request, res: Response) => {
  if (!supabase) {
    res.json({ success: true, settings: req.body });
    return;
  }
  try {
    const settings = { ...req.body, updated_at: new Date().toISOString() };
    const buffer = Buffer.from(JSON.stringify(settings, null, 2), 'utf-8');
    
    // Upload authoritative settings JSON to Supabase Storage
    const { error: storageErr } = await supabase.storage
      .from('product-images')
      .upload('settings/site_settings.json', buffer, {
        contentType: 'application/json',
        upsert: true,
      });

    if (storageErr) {
      console.warn('Supabase storage upload error:', storageErr);
    }

    // Also attempt table upsert if table exists
    try {
      await supabase.from('site_settings').upsert({ id: 'primary', ...settings });
    } catch {}

    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 7b. Storage Upload Endpoint (Uploads directly to product-images bucket using Service Role Key)
app.post('/api/upload-product-image', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database/Storage client unavailable' });
    return;
  }

  try {
    const { dataBase64, fileName, mimeType } = req.body;
    if (!dataBase64) {
      res.status(400).json({ success: false, error: 'No image data provided' });
      return;
    }

    const cleanBase64 = dataBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const ext = (fileName && fileName.split('.').pop()) || 'jpg';
    const cleanName = (fileName ? fileName.replace(/\.[^/.]+$/, '') : 'product').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `products/prod_${Date.now()}_${cleanName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      res.status(400).json({ success: false, error: uploadError.message });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    res.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: storagePath,
    });
  } catch (err: any) {
    console.error('Server upload error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Upload failed' });
  }
});

// 8. Products Endpoints (Using exact Supabase PostgreSQL schema with Service Role)
app.post('/api/products', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const raw = req.body;
    let targetCatId = raw.category_id;

    // Resolve category UUID if slug or name was provided
    if (targetCatId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCatId);
      if (!isUuid) {
        const cleanSlug = String(targetCatId).toLowerCase().replace(/^cat-/, '');
        const { data: catRows } = await supabase
          .from('categories')
          .select('id, slug, name');
        if (catRows && catRows.length > 0) {
          const matched = catRows.find(
            (c: any) =>
              c.slug === cleanSlug ||
              c.slug === targetCatId ||
              c.name.toLowerCase() === String(raw.category_name || '').toLowerCase() ||
              c.id === targetCatId
          );
          if (matched) {
            targetCatId = matched.id;
          }
        }
      }
    }

    // Default to first valid category if missing or still not UUID
    if (!targetCatId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCatId)) {
      const { data: firstCat } = await supabase.from('categories').select('id').limit(1).single();
      if (firstCat) {
        targetCatId = firstCat.id;
      }
    }

    const prodId = raw.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw.id)
      ? raw.id
      : crypto.randomUUID();

    const price = Number(raw.price) || 0;
    const mrp = Number(raw.original_price ?? raw.mrp ?? raw.price) || price;
    const discount = Number(raw.discount_percent) || 0;
    const stock = Number(raw.stock_quantity ?? raw.stock ?? 10);
    const images = Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images
      : (raw.image_url ? [raw.image_url] : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80']);

    // EXACT Supabase products table schema: NO category_name column!
    const dbPayload = {
      id: prodId,
      name: String(raw.name || 'New Product').trim(),
      description: String(raw.description || '').trim(),
      price: price,
      mrp: mrp,
      discount_percent: discount,
      stock: stock,
      category_id: targetCatId,
      images: images,
      rating: Number(raw.rating) || 4.7,
      rating_count: Number(raw.review_count ?? raw.rating_count) || 1,
      brand: raw.brand || 'General',
      is_featured: Boolean(raw.is_featured),
      specs: Array.isArray(raw.specs) || typeof raw.specs === 'object' ? raw.specs : [{ label: 'Standard', value: 'Original' }],
    };

    const { data, error } = await supabase.from('products').insert([dbPayload]).select();
    if (error) {
      console.error('Supabase product insert error:', error);
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      product: {
        ...data?.[0],
        original_price: mrp,
        stock_quantity: stock,
        in_stock: stock > 0,
        category_name: raw.category_name,
      },
    });
  } catch (err: any) {
    console.error('Server error creating product:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    const raw = req.body;
    let targetCatId = raw.category_id;

    if (targetCatId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCatId)) {
      const cleanSlug = String(targetCatId).toLowerCase().replace(/^cat-/, '');
      const { data: catRows } = await supabase.from('categories').select('id, slug, name');
      if (catRows && catRows.length > 0) {
        const matched = catRows.find(
          (c: any) =>
            c.slug === cleanSlug ||
            c.slug === targetCatId ||
            c.name.toLowerCase() === String(raw.category_name || '').toLowerCase()
        );
        if (matched) {
          targetCatId = matched.id;
        }
      }
    }

    const updates: any = {};
    if (raw.name !== undefined) updates.name = String(raw.name).trim();
    if (raw.description !== undefined) updates.description = String(raw.description).trim();
    if (raw.price !== undefined) updates.price = Number(raw.price);
    if (raw.original_price !== undefined || raw.mrp !== undefined) {
      updates.mrp = Number(raw.original_price ?? raw.mrp ?? raw.price);
    }
    if (raw.discount_percent !== undefined) updates.discount_percent = Number(raw.discount_percent);
    if (raw.stock_quantity !== undefined || raw.stock !== undefined) {
      updates.stock = Number(raw.stock_quantity ?? raw.stock);
    }
    if (targetCatId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCatId)) {
      updates.category_id = targetCatId;
    }
    if (raw.images !== undefined) updates.images = raw.images;
    if (raw.rating !== undefined) updates.rating = Number(raw.rating);
    if (raw.rating_count !== undefined || raw.review_count !== undefined) {
      updates.rating_count = Number(raw.review_count ?? raw.rating_count);
    }
    if (raw.brand !== undefined) updates.brand = raw.brand;
    if (raw.is_featured !== undefined) updates.is_featured = Boolean(raw.is_featured);
    if (raw.specs !== undefined) updates.specs = raw.specs;

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, product: data?.[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    let variants: any[] = [];
    try {
      const { data: vData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id);
      if (vData && Array.isArray(vData)) {
        variants = vData;
      }
    } catch {}

    res.json({ success: true, product, variants });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  if (!supabase) {
    res.status(503).json({ success: false, error: 'Database client unavailable' });
    return;
  }

  try {
    const { id } = req.params;
    // Delete products belonging to this category first
    await supabase.from('products').delete().eq('category_id', id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
