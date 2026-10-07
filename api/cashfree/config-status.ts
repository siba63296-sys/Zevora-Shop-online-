import { getCashfreeConfig } from '../../server';

export default function handler(req: any, res: any) {
  const config = getCashfreeConfig();

  console.log('[Vercel Serverless /api/cashfree/config-status]', {
    configured: config.isConfigured,
    environment: config.env,
    appIdConfigured: Boolean(config.appId),
    secretConfigured: Boolean(config.secretKey),
    apiVersion: config.apiVersion,
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
