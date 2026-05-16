import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';
import { createNotification } from '../lib/notify';
import { addPoints } from './stats';

export async function handleFollow(req: Request, res: Response) {
  try {
    const followeeId = parseInt(String(req.params.id));
    const followerId = req.user!.userId;

    if (followeeId === followerId) return fail(res, '不能关注自己');

    const existing = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId, followeeId } },
    });
    if (existing) return fail(res, '已关注');

    await prisma.follow.create({ data: { followerId, followeeId } });
    await prisma.user.update({ where: { id: followerId }, data: { followCount: { increment: 1 } } });
    await addPoints(followerId, 2);
    await prisma.user.update({ where: { id: followeeId }, data: { fanCount: { increment: 1 } } });

    const actor = await prisma.user.findUnique({ where: { id: followerId } });
    await createNotification({
      userId: followeeId,
      type: 'follow',
      actorId: followerId,
      content: `${actor?.nickname || ''} 关注了你`,
    });

    return success(res, null);
  } catch {
    return fail(res, '关注失败');
  }
}

export async function handleUnfollow(req: Request, res: Response) {
  try {
    const followeeId = parseInt(String(req.params.id));
    const followerId = req.user!.userId;

    const existing = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId, followeeId } },
    });
    if (!existing) return fail(res, '未关注');

    await prisma.follow.delete({ where: { followerId_followeeId: { followerId, followeeId } } });
    await prisma.user.update({ where: { id: followerId }, data: { followCount: { decrement: 1 } } });
    await prisma.user.update({ where: { id: followeeId }, data: { fanCount: { decrement: 1 } } });

    return success(res, null);
  } catch {
    return fail(res, '取消关注失败');
  }
}

export async function handleGetFollowers(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    const follows = await prisma.follow.findMany({
      where: { followeeId: userId },
      include: { follower: { select: { id: true, nickname: true, avatar: true, city: true, bio: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return success(res, follows.map(f => f.follower));
  } catch {
    return fail(res, '获取粉丝列表失败');
  }
}

export async function handleGetFollowing(req: Request, res: Response) {
  try {
    const userId = parseInt(String(req.params.id));
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { followee: { select: { id: true, nickname: true, avatar: true, city: true, bio: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return success(res, follows.map(f => f.followee));
  } catch {
    return fail(res, '获取关注列表失败');
  }
}

export async function handleGetFollowingFeed(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));

    const followings = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followeeId: true },
    });
    const followingIds = followings.map(f => Number(f.followeeId));

    if (followingIds.length === 0) return success(res, { data: [], total: 0, page, page_size: pageSize });

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where: { userId: { in: followingIds } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, nickname: true, avatar: true, city: true } } },
      }),
      prisma.feed.count({ where: { userId: { in: followingIds } } }),
    ]);

    const likes = await prisma.feedLike.findMany({
      where: { userId, feedId: { in: feeds.map(f => f.id) } },
      select: { feedId: true },
    });
    const likedIds = new Set(likes.map(l => Number(l.feedId)));
    const data = feeds.map(f => ({ ...f, isLiked: likedIds.has(Number(f.id)) }));

    return success(res, { data, total, page, page_size: pageSize });
  } catch {
    return fail(res, '获取关注动态失败');
  }
}
