import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleGetNotifications(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId: req.user!.userId } }),
      prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
    ]);

    return success(res, { data: notifications, total, unreadCount, page, page_size: pageSize });
  } catch {
    return fail(res, '获取通知失败');
  }
}

export async function handleMarkRead(req: Request, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.userId },
      data: { isRead: true },
    });
    return success(res, null);
  } catch {
    return fail(res, '操作失败');
  }
}

export async function handleMarkAllRead(req: Request, res: Response) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    return success(res, null);
  } catch {
    return fail(res, '操作失败');
  }
}
