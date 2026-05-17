import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleGetTopics(req: Request, res: Response) {
  try {
    const feeds = await prisma.feed.findMany({
      where: { isDraft: false },
      select: { topics: true },
    });
    const count: Record<string, number> = {};
    feeds.forEach(f => f.topics.forEach(t => { count[t] = (count[t] || 0) + 1; }));
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 50);
    return success(res, sorted.map(([name, count]) => ({ name, count })));
  } catch { return fail(res, '获取话题失败'); }
}
