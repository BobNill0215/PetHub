import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleGetReports(req: Request, res: Response) {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return success(res, reports);
  } catch { return fail(res, '获取举报列表失败'); }
}
