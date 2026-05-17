import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleExportMyData(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const [user, feeds, comments, likes, bookmarks] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, nickname: true, bio: true, points: true, createdAt: true } }),
      prisma.feed.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { content: true, images: true, topics: true, likeCount: true, commentCount: true, createdAt: true } }),
      prisma.feedComment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { content: true, feedId: true, createdAt: true } }),
      prisma.feedLike.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { feedId: true, createdAt: true } }),
      prisma.feedBookmark.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { feedId: true, createdAt: true } }),
    ]);
    return success(res, { exportedAt: new Date().toISOString(), user, stats: { feeds: feeds.length, comments: comments.length, likes: likes.length, bookmarks: bookmarks.length }, data: { feeds, comments, likes, bookmarks } });
  } catch { return fail(res, '导出失败'); }
}
