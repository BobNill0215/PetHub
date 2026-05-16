import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

// ── User Stats ──

export async function handleGetUserStats(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    const [feedCount, likeCount, commentCount, totalLikes, bookmarkCount] = await Promise.all([
      prisma.feed.count({ where: { userId } }),
      prisma.feedLike.count({ where: { feed: { userId } } }),
      prisma.feedComment.count({ where: { feed: { userId } } }),
      prisma.feedLike.count(),
      prisma.feedBookmark.count({ where: { feed: { userId } } }),
    ]);
    return success(res, { feedCount, likeCount, commentCount, totalLikes, bookmarkCount });
  } catch { return fail(res, '获取统计失败'); }
}

// ── Points System ──

export async function addPoints(userId: number, amount: number) {
  await prisma.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
}

export async function handleGetPoints(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { points: true } });
    return success(res, { points: user?.points || 0 });
  } catch { return fail(res, '获取积分失败'); }
}

// ── Notification Settings ──

export async function handleGetNotifSettings(req: Request, res: Response) {
  try {
    let settings = await prisma.notificationSetting.findUnique({ where: { userId: req.user!.userId } });
    if (!settings) {
      settings = await prisma.notificationSetting.create({ data: { userId: req.user!.userId } });
    }
    return success(res, settings);
  } catch { return fail(res, '获取设置失败'); }
}

const notifSettingsSchema = z.object({
  onLike: z.boolean().optional(),
  onComment: z.boolean().optional(),
  onFollow: z.boolean().optional(),
  onMessage: z.boolean().optional(),
});

export async function handleUpdateNotifSettings(req: Request, res: Response) {
  try {
    const body = notifSettingsSchema.parse(req.body);
    const settings = await prisma.notificationSetting.upsert({
      where: { userId: req.user!.userId },
      create: { userId: req.user!.userId, ...body },
      update: body,
    });
    return success(res, settings);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '更新失败');
  }
}
