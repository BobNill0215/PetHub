import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleSearch(req: Request, res: Response) {
  try {
    const q = (req.query.q as string || '').trim();
    const type = req.query.type as string || 'all';
    if (!q) return success(res, { feeds: [], products: [], users: [] });

    const [feeds, products, users] = await Promise.all([
      type !== 'users' ? prisma.feed.findMany({
        where: { content: { contains: q, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { id: true, nickname: true, avatar: true, city: true } } },
      }) : [],
      type !== 'feeds' ? prisma.product.findMany({
        where: {
          status: 'LISTED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { seller: { select: { id: true, nickname: true, avatar: true } } },
      }) : [],
      type !== 'products' ? prisma.user.findMany({
        where: {
          OR: [
            { nickname: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, uuid: true, nickname: true, avatar: true, city: true, bio: true },
      }) : [],
    ]);

    return success(res, { feeds, products, users, query: q });
  } catch {
    return fail(res, '搜索失败');
  }
}
