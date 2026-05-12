import { Response } from 'express';

export function success(res: Response, data: unknown = null, status = 200) {
  return res.status(status).json({ code: 0, message: 'ok', data });
}

export function fail(res: Response, message: string, code = 40001, status = 400) {
  return res.status(status).json({ code, message, data: null });
}

export function paginated(res: Response, data: unknown[], total: number, page: number, pageSize: number) {
  return res.status(200).json({
    code: 0,
    message: 'ok',
    data,
    total,
    page,
    page_size: pageSize,
  });
}
