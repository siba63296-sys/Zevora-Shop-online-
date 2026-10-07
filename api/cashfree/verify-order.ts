import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/cashfree/verify-order';
  return app(req, res);
}
