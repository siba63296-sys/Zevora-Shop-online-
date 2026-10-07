import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/cashfree/webhook';
  return app(req, res);
}
