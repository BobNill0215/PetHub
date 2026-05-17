import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';
import { createNotification } from '../lib/notify';
import { addPoints } from './stats';

// ── Likes ──

export async function handleLikeFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    const existing = await prisma.feedLike.findUnique({ where: { feedId_userId: { feedId, userId } } });
    if (existing) return fail(res, '已经赞过');

    await prisma.feedLike.create({ data: { feedId, userId } });
    await prisma.feed.update({ where: { id: feedId }, data: { likeCount: { increment: 1 } } });
    await addPoints(userId, 2);

    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (feed) {
      const setting = await prisma.notificationSetting.findUnique({ where: { userId: Number(feed.userId) } });
      if (!setting || setting.onLike) await createNotification({ userId: Number(feed.userId), type: 'like', actorId: userId, targetType: 'feed', targetId: feedId, content: '赞了你的帖子' });
    }
    return success(res, null);
  } catch { return fail(res, '点赞失败'); }
}

export async function handleUnlikeFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    const existing = await prisma.feedLike.findUnique({ where: { feedId_userId: { feedId, userId } } });
    if (!existing) return fail(res, '尚未点赞');
    await prisma.feedLike.delete({ where: { feedId_userId: { feedId, userId } } });
    await prisma.feed.update({ where: { id: feedId }, data: { likeCount: { decrement: 1 } } });
    return success(res, null);
  } catch { return fail(res, '取消点赞失败'); }
}

export async function handleGetLikes(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const likes = await prisma.feedLike.findMany({
      where: { feedId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
    return success(res, likes.map(l => l.user));
  } catch { return fail(res, '获取点赞列表失败'); }
}

// ── Comments ──

const createCommentSchema = z.object({ content: z.string().min(1).max(500), parentId: z.number().optional() });

export async function handleGetComments(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const comments = await prisma.feedComment.findMany({
      where: { feedId }, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
    return success(res, comments);
  } catch { return fail(res, '获取评论失败'); }
}

export async function handleCreateComment(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const body = createCommentSchema.parse(req.body);
    const comment = await prisma.feedComment.create({
      data: { feedId, userId: req.user!.userId, content: body.content, parentId: body.parentId },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });
    await prisma.feed.update({ where: { id: feedId }, data: { commentCount: { increment: 1 } } });
    await addPoints(req.user!.userId, 3);
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (feed) {
      const setting = await prisma.notificationSetting.findUnique({ where: { userId: Number(feed.userId) } });
      if (!setting || setting.onComment) await createNotification({ userId: Number(feed.userId), type: 'comment', actorId: req.user!.userId, targetType: 'feed', targetId: feedId, content: '评论了你的帖子' });
    }
    return success(res, comment, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '评论失败');
  }
}

// ── Bookmarks ──

export async function handleBookmarkFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    const existing = await prisma.feedBookmark.findUnique({ where: { feedId_userId: { feedId, userId } } });
    if (existing) return fail(res, '已收藏');
    await prisma.feedBookmark.create({ data: { feedId, userId } });
    await prisma.feed.update({ where: { id: feedId }, data: { bookmarkCount: { increment: 1 } } });
    return success(res, null);
  } catch { return fail(res, '收藏失败'); }
}

export async function handleUnbookmarkFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    await prisma.feedBookmark.delete({ where: { feedId_userId: { feedId, userId } } });
    await prisma.feed.update({ where: { id: feedId }, data: { bookmarkCount: { decrement: 1 } } });
    return success(res, null);
  } catch { return fail(res, '取消收藏失败'); }
}

export async function handleGetBookmarks(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));
    const bookmarks = await prisma.feedBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { feed: { include: { user: { select: { id: true, nickname: true, avatar: true, city: true } } } } },
    });
    const total = await prisma.feedBookmark.count({ where: { userId } });
    return success(res, { data: bookmarks.map(b => ({ ...b.feed, bookmarkedAt: b.createdAt })), total, page, page_size: pageSize });
  } catch { return fail(res, '获取收藏列表失败'); }
}

// ── Report ──

const reportSchema = z.object({ reason: z.string().min(1).max(500) });

export async function handleReportFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const body = reportSchema.parse(req.body);
    await prisma.report.create({ data: { reporterId: req.user!.userId, targetType: 'feed', targetId: feedId, reason: body.reason } });
    return success(res, null, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '举报失败');
  }
}

// ── Comment Likes ──

export async function handleLikeComment(req: Request, res: Response) {
  try {
    const commentId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    const existing = await prisma.feedCommentLike.findUnique({ where: { commentId_userId: { commentId, userId } } });
    if (existing) return fail(res, '已经赞过');
    await prisma.feedCommentLike.create({ data: { commentId, userId } });
    return success(res, null);
  } catch { return fail(res, '点赞失败'); }
}

export async function handleUnlikeComment(req: Request, res: Response) {
  try {
    const commentId = parseInt(String(req.params.id));
    await prisma.feedCommentLike.delete({ where: { commentId_userId: { commentId, userId: req.user!.userId } } });
    return success(res, null);
  } catch { return fail(res, '取消点赞失败'); }
}

// ── Share / Repost ──

export async function handleShareFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (!feed) return fail(res, '帖子不存在', 40401, 404);
    await prisma.feed.update({ where: { id: feedId }, data: { shareCount: { increment: 1 } } });
    return success(res, null);
  } catch { return fail(res, '转发失败'); }
}

// ── Edit Feed ──

const editFeedSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  images: z.array(z.string()).max(9).optional(),
  videoUrl: z.string().optional(),
  links: z.array(z.object({ title: z.string(), url: z.string() })).max(5).optional(),
  topics: z.array(z.string()).max(10).optional(),
  category: z.string().max(30).optional(),
});

export async function handleEditFeed(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findFirst({ where: { id: feedId, userId: req.user!.userId } });
    if (!feed) return fail(res, '帖子不存在或无权编辑', 40401, 404);

    const body = editFeedSchema.parse(req.body);
    const data: any = {};
    if (body.content !== undefined) data.content = body.content;
    if (body.images !== undefined) data.images = body.images;
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl;
    if (body.links !== undefined) data.links = body.links;
    if (body.topics !== undefined) data.topics = body.topics;
    if (body.category !== undefined) data.category = body.category;

    const updated = await prisma.feed.update({ where: { id: feedId }, data });
    return success(res, updated);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '编辑失败');
  }
}
