import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleGetUserById(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pets: { orderBy: { createdAt: 'desc' } } },
    });
    if (!user) return fail(res, '用户不存在', 40401, 404);

    const feedCount = await prisma.feed.count({ where: { userId } });
    const followerCount = await prisma.follow.count({ where: { followeeId: userId } });
    const followingCount = await prisma.follow.count({ where: { followerId: userId } });

    const { passwordHash, ...safe } = user;
    return success(res, { ...safe, feedCount, followerCount, followingCount });
  } catch {
    return fail(res, '获取用户信息失败');
  }
}

const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  avatar: z.string().optional(),
  city: z.string().max(50).optional(),
  gender: z.number().int().min(0).max(2).optional(),
});

export async function handleUpdateProfile(req: Request, res: Response) {
  try {
    const body = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: body,
    });
    const { passwordHash, ...safe } = user;
    return success(res, safe);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '更新失败');
  }
}

export async function handleGetUserFeeds(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, uuid: true, nickname: true, avatar: true, city: true } },
        },
      }),
      prisma.feed.count({ where: { userId } }),
    ]);

    return success(res, { data: feeds, total, page, page_size: pageSize });
  } catch {
    return fail(res, '获取用户动态失败');
  }
}
