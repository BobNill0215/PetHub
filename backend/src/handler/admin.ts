import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleAdminStats(req: Request, res: Response) {
  try {
    const days = parseInt(String(req.query.days)) || 7;
    const since = new Date(); since.setDate(since.getDate() - days);

    const [totalUsers, newUsers, totalFeeds, newFeeds, totalComments, newComments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.feed.count({ where: { isDraft: false } }),
      prisma.feed.count({ where: { isDraft: false, createdAt: { gte: since } } }),
      prisma.feedComment.count(),
      prisma.feedComment.count({ where: { createdAt: { gte: since } } }),
    ]);

    const catStats = await prisma.feed.groupBy({ by: ['category'], where: { isDraft: false }, _count: true });

    return success(res, { totalUsers, newUsers, totalFeeds, newFeeds, totalComments, newComments, cats: catStats.map(c => ({ category: c.category, count: c._count })) });
  } catch { return fail(res, '获取统计失败'); }
}

export async function handleAdminDashboard(_req: Request, res: Response) {
  try {
    const [userCount, feedCount, reportCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.feed.count({ where: { isDraft: false } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.feedComment.count(),
    ]);
    return success(res, { userCount, feedCount, reportCount, commentCount });
  } catch { return fail(res, '获取数据失败'); }
}

export async function handleAdminUsers(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20, take: 20,
      select: { id: true, uuid: true, email: true, nickname: true, role: true, status: true, points: true, feedCount: true, createdAt: true },
    });
    const total = await prisma.user.count();
    return success(res, { data: users, total, page, page_size: 20 });
  } catch { return fail(res, '获取用户列表失败'); }
}

export async function handleAdminBanUser(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    await prisma.user.update({ where: { id: userId }, data: { status: 'BANNED' } });
    return success(res, null);
  } catch { return fail(res, '操作失败'); }
}

export async function handleAdminReports(_req: Request, res: Response) {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return success(res, reports);
  } catch { return fail(res, '获取举报列表失败'); }
}

export async function handleAdminResolveReport(req: Request, res: Response) {
  try {
    await prisma.report.update({ where: { id: parseInt(String(req.params.id)) }, data: { status: 'resolved' } });
    return success(res, null);
  } catch { return fail(res, '操作失败'); }
}
