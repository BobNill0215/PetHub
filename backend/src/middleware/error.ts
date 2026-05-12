import { Request, Response, NextFunction } from 'express';
import { fail } from '../pkg/response';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err);
  return fail(res, err.message || '服务器内部错误', 50000, 500);
}

export function notFoundHandler(_req: Request, res: Response) {
  return fail(res, '接口不存在', 40401, 404);
}
