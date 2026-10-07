// Standalone Vercel Serverless Function: GET /api/cashfree/config-status
// Self-contained: No local relative imports to avoid ESM/bundler resolution failures on Vercel.

function sanitize(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/^["'`]|["'`]$/g, '')
    .replace(/\r?\n|\r/g, '')
    .trim();
}

export function getCashfreeConfig() {
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

  const appId = sanitize(rawAppId);
  const secretKey = sanitize(rawSecretKey);
  const apiVersion = sanitize(rawApiVersion) || '2023-08-01';

  // Rule 12: In Vercel or Production deployment, strictly enforce PRODUCTION
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

  return {
    appId,
    secretKey,
    env,
    apiVersion,
    baseUrl,
    isConfigured,
  };
}

export default function handler(req: any, res: any) {
  // CORS & Security headers
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const config = getCashfreeConfig();

    const envKeysDetected = Object.keys(process.env).filter((k) =>
      k.toUpperCase().includes('CASHFREE')
    );

    return res.status(200).json({
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
        envKeysDetected: envKeysDetected.map((k) => k.trim()),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      configured: false,
      error: 'Error evaluating Cashfree configuration',
      message: err?.message || String(err),
    });
  }
}
