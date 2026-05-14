import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

const createFeedSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(2000),
  images: z.array(z.string()).max(9).optional(),
  videoUrl: z.string().optional(),
  topics: z.array(z.string()).max(10).optional(),
  petIds: z.array(z.number()).optional(),
});

export async function handleCreateFeed(req: Request, res: Response) {
  try {
    const body = createFeedSchema.parse(req.body);
    const feed = await prisma.feed.create({
      data: {
        content: body.content,
        images: body.images || [],
        videoUrl: body.videoUrl,
        topics: body.topics || [],
        petIds: body.petIds || [],
        userId: req.user!.userId,
      },
    });

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { feedCount: { increment: 1 } },
    });

    return success(res, feed, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '发布失败');
  }
}

export async function handleGetFeeds(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));
    const currentUserId = req.user?.userId;

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, uuid: true, nickname: true, avatar: true, city: true },
          },
        },
      }),
      prisma.feed.count(),
    ]);

    let likedFeedIds: number[] = [];
    if (currentUserId) {
      const likes = await prisma.feedLike.findMany({
        where: { userId: currentUserId, feedId: { in: feeds.map(f => f.id) } },
        select: { feedId: true },
      });
      likedFeedIds = likes.map(l => Number(l.feedId));
    }

    const data = feeds.map(f => ({
      ...f,
      isLiked: likedFeedIds.includes(Number(f.id)),
    }));

    return success(res, { data, total, page, page_size: pageSize });
  } catch {
    return fail(res, '获取动态失败');
  }
}

export async function handleDeleteFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findFirst({
      where: { id: feedId, userId: req.user!.userId },
    });
    if (!feed) return fail(res, '动态不存在或无权删除', 40401, 404);

    await prisma.feed.delete({ where: { id: feedId } });
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { feedCount: { decrement: 1 } },
    });

    return success(res, null);
  } catch {
    return fail(res, '删除失败');
  }
}
