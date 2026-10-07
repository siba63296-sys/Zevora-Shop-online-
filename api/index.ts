import app, { getCashfreeConfig } from '../server';

export default function handler(req: any, res: any) {
  // 1. Reconstruct original path from query parameter (e.g. ?__path=cashfree/config-status)
  const qPath = req.query && (req.query.__path || req.query.path || req.query['1'] || req.query['0']);
  if (typeof qPath === 'string' && qPath.trim()) {
    const clean = qPath.trim().replace(/^\/+/, '');
    req.url = clean.startsWith('api/') ? `/${clean}` : `/api/${clean}`;
  } else {
    // 2. Decode Vercel regex rewrite capture group header (1=cashfree%2Fconfig-status)
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

    // 3. Check matched-path if it contains subpath and not just /api
    const rawMatched = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-original-url']) as string;
    if (rawMatched && rawMatched !== '/api' && rawMatched !== '/api/' && rawMatched !== '/' && (req.url === '/api' || req.url === '/api/' || req.url === '/')) {
      req.url = rawMatched.startsWith('/api') ? rawMatched : `/api${rawMatched.startsWith('/') ? '' : '/'}${rawMatched}`;
    }
  }

  // 4. Ensure /api prefix is present for Express routing
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

  // Direct fast-path for config-status check
  if (req.method === 'GET' && (req.url === '/api/cashfree/config-status' || req.url === '/cashfree/config-status')) {
    const config = getCashfreeConfig();
    console.log('[Cashfree Serverless api/index.ts config-status]', {
      configured: config.isConfigured,
      environment: config.env,
      appIdConfigured: Boolean(config.appId),
      secretConfigured: Boolean(config.secretKey),
    });

    if (res.setHeader) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
    }

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
        envKeysDetected: Object.keys(process.env)
          .filter((k) => k.toUpperCase().includes('CASHFREE'))
          .map((k) => k.trim()),
      },
    });
  }

  return app(req, res);
}
