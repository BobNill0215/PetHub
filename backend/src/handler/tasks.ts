import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleGetDailyTasks(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [feedsToday, commentsToday, likesGiven] = await Promise.all([
      prisma.feed.count({ where: { userId, createdAt: { gte: today } } }),
      prisma.feedComment.count({ where: { userId, createdAt: { gte: today } } }),
      prisma.feedLike.count({ where: { userId, createdAt: { gte: today } } }),
    ]);

    const tasks = [
      { id: 'post', name: '发布帖子', done: feedsToday >= 1, max: 1, current: Math.min(feedsToday, 1), points: 10 },
      { id: 'comment', name: '发表评论', done: commentsToday >= 3, max: 3, current: Math.min(commentsToday, 3), points: 5 },
      { id: 'like', name: '点赞帖子', done: likesGiven >= 5, max: 5, current: Math.min(likesGiven, 5), points: 3 },
    ];

    const totalDone = tasks.filter(t => t.done).length;
    const totalPoints = tasks.filter(t => t.done).reduce((s, t) => s + t.points, 0);

    return success(res, { tasks, totalDone, totalPoints, date: today.toISOString().slice(0, 10) });
  } catch { return fail(res, '获取任务失败'); }
}
