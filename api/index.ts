import app from '../server';

export default function handler(req: any, res: any) {
  // Normalize Vercel rewritten URL from x-matched-path or x-forwarded-uri
  const matched = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-now-route-matches']) as string;
  if (matched && (req.url === '/api' || req.url === '/api/' || req.url === '/' || !req.url.startsWith('/api'))) {
    req.url = matched;
  }
  return app(req, res);
}
