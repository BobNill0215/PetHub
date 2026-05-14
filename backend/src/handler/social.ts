import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleLikeFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;

    const existing = await prisma.feedLike.findUnique({
      where: { feedId_userId: { feedId, userId } },
    });
    if (existing) return fail(res, '已经赞过');

    await prisma.feedLike.create({ data: { feedId, userId } });
    await prisma.feed.update({ where: { id: feedId }, data: { likeCount: { increment: 1 } } });

    return success(res, null);
  } catch {
    return fail(res, '点赞失败');
  }
}

export async function handleUnlikeFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;

    const existing = await prisma.feedLike.findUnique({
      where: { feedId_userId: { feedId, userId } },
    });
    if (!existing) return fail(res, '尚未点赞');

    await prisma.feedLike.delete({ where: { feedId_userId: { feedId, userId } } });
    await prisma.feed.update({ where: { id: feedId }, data: { likeCount: { decrement: 1 } } });

    return success(res, null);
  } catch {
    return fail(res, '取消点赞失败');
  }
}

const createCommentSchema = z.object({
  content: z.string().min(1, '评论不能为空').max(500),
  parentId: z.number().optional(),
});

export async function handleGetComments(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const comments = await prisma.feedComment.findMany({
      where: { feedId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, uuid: true, nickname: true, avatar: true } },
      },
    });
    return success(res, comments);
  } catch {
    return fail(res, '获取评论失败');
  }
}

export async function handleCreateComment(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const body = createCommentSchema.parse(req.body);

    const comment = await prisma.feedComment.create({
      data: {
        feedId,
        userId: req.user!.userId,
        content: body.content,
        parentId: body.parentId,
      },
      include: {
        user: { select: { id: true, uuid: true, nickname: true, avatar: true } },
      },
    });

    await prisma.feed.update({ where: { id: feedId }, data: { commentCount: { increment: 1 } } });

    return success(res, comment, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '评论失败');
  }
}
