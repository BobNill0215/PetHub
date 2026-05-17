import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';
import { addPoints } from './stats';

const linkItemSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url('链接格式不正确'),
});

const CATEGORIES = ['cat', 'dog', 'smallpet', 'aquatic', 'reptile', 'insect', 'general'] as const;

const createFeedSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(2000),
  category: z.enum(CATEGORIES).optional(),
  images: z.array(z.string()).max(9).optional(),
  videoUrl: z.string().optional(),
  links: z.array(linkItemSchema).max(5).optional(),
  topics: z.array(z.string()).max(10).optional(),
  petIds: z.array(z.number()).optional(),
  isDraft: z.boolean().optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().max(200).optional(),
});

export async function handleCreateFeed(req: Request, res: Response) {
  try {
    const body = createFeedSchema.parse(req.body);
    const feed = await prisma.feed.create({
      data: {
        content: body.content,
        category: body.category || 'general',
        images: body.images || [],
        videoUrl: body.videoUrl,
        links: body.links || [],
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        eventLocation: body.eventLocation,
        topics: body.topics || [],
        petIds: body.petIds || [],
        userId: req.user!.userId,
      },
    });

    if (!body.isDraft) {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { feedCount: { increment: 1 } },
      });
      await addPoints(req.user!.userId, 10);
    }

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
    const sort = String(req.query.sort || 'new');
    const category = req.query.category as string;
    const where: any = { isDraft: false };
    if (category && CATEGORIES.includes(category as any)) where.category = category;

    const orderBy: any = sort === 'hot'
      ? [{ isPinned: 'desc' }, { likeCount: 'desc' }, { commentCount: 'desc' }, { createdAt: 'desc' }]
      : [{ isPinned: 'desc' }, { createdAt: 'desc' }];

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where,
        orderBy,
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

export async function handleGetFeedById(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findUnique({
      where: { id: feedId },
      include: {
        user: { select: { id: true, uuid: true, nickname: true, avatar: true, city: true } },
      },
    });
    if (!feed) return fail(res, '帖子不存在', 40401, 404);

    await prisma.feed.update({ where: { id: feedId }, data: { viewCount: { increment: 1 } } });

  let isLiked = false;
    if (req.user?.userId) {
      const like = await prisma.feedLike.findUnique({
        where: { feedId_userId: { feedId, userId: req.user.userId } },
      });
      isLiked = !!like;
    }

    return success(res, { ...feed, viewCount: feed.viewCount + 1, isLiked });
  } catch {
    return fail(res, '获取帖子失败');
  }
}

export async function handleTogglePin(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (!feed) return fail(res, '帖子不存在', 40401, 404);
    const updated = await prisma.feed.update({
      where: { id: feedId },
      data: { isPinned: !feed.isPinned },
    });
    return success(res, updated);
  } catch { return fail(res, '操作失败'); }
}

export async function handleToggleFeatured(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (!feed) return fail(res, '帖子不存在', 40401, 404);
    const updated = await prisma.feed.update({
      where: { id: feedId },
      data: { isFeatured: !feed.isFeatured },
    });
    return success(res, updated);
  } catch { return fail(res, '操作失败'); }
}

export async function handleGetFeatured(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(20, Math.max(1, parseInt(String(req.query.pageSize)) || 10));

    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where: { isFeatured: true },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, nickname: true, avatar: true, city: true } } },
      }),
      prisma.feed.count({ where: { isFeatured: true } }),
    ]);

    let likedFeedIds: number[] = [];
    if (req.user?.userId) {
      const likes = await prisma.feedLike.findMany({
        where: { userId: req.user.userId, feedId: { in: feeds.map(f => f.id) } },
        select: { feedId: true },
      });
      likedFeedIds = likes.map(l => Number(l.feedId));
    }
    const data = feeds.map(f => ({ ...f, isLiked: likedFeedIds.includes(Number(f.id)) }));
    return success(res, { data, total, page, page_size: pageSize });
  } catch { return fail(res, '获取精华帖失败'); }
}

export async function handleUpdateFeedImages(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findFirst({
      where: { id: feedId, userId: req.user!.userId },
    });
    if (!feed) return fail(res, '帖子不存在或无权编辑', 40401, 404);

    const { images, videoUrl } = req.body;
    const updated = await prisma.feed.update({
      where: { id: feedId },
      data: {
        ...(images ? { images } : {}),
        ...(videoUrl !== undefined ? { videoUrl } : {}),
      },
    });
    return success(res, updated);
  } catch { return fail(res, '更新失败'); }
}

export async function handleGetRelatedFeeds(req: Request, res: Response) {
  try {
    const feedId = parseInt(String(req.params.id));
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (!feed) return fail(res, '帖子不存在', 40401, 404);

    const where: any = { id: { not: feedId } };
    if (feed.topics.length > 0) where.topics = { hasSome: feed.topics };
    else if (feed.category) where.category = feed.category;

    const related = await prisma.feed.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
    });

    return success(res, related);
  } catch { return fail(res, '获取推荐失败'); }
}

export async function handleGetDrafts(req: Request, res: Response) {
  try {
    const drafts = await prisma.feed.findMany({
      where: { userId: req.user!.userId, isDraft: true },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, drafts);
  } catch { return fail(res, '获取草稿失败'); }
}

export async function handleGetTrending(req: Request, res: Response) {
  try {
    const [byViews, byLikes, byComments] = await Promise.all([
      prisma.feed.findMany({ orderBy: { viewCount: 'desc' }, take: 10, include: { user: { select: { id: true, nickname: true, avatar: true } } } }),
      prisma.feed.findMany({ orderBy: { likeCount: 'desc' }, take: 10, include: { user: { select: { id: true, nickname: true, avatar: true } } } }),
      prisma.feed.findMany({ orderBy: { commentCount: 'desc' }, take: 10, include: { user: { select: { id: true, nickname: true, avatar: true } } } }),
    ]);
    return success(res, { byViews, byLikes, byComments });
  } catch { return fail(res, '获取热门失败'); }
}

export async function handleGetCategories(_req: Request, res: Response) {
  try {
    const counts = await prisma.feed.groupBy({ by: ['category'], _count: true });
    const countMap: Record<string, number> = {};
    counts.forEach(c => { countMap[c.category] = c._count; });

    const list = [
      { id: 'general', name: '综合讨论', icon: '💬', count: countMap.general || 0 },
      { id: 'cat', name: '猫咪', icon: '🐱', count: countMap.cat || 0 },
      { id: 'dog', name: '狗狗', icon: '🐶', count: countMap.dog || 0 },
      { id: 'smallpet', name: '小宠', icon: '🐰', count: countMap.smallpet || 0 },
      { id: 'aquatic', name: '水族', icon: '🐟', count: countMap.aquatic || 0 },
      { id: 'reptile', name: '爬虫', icon: '🦎', count: countMap.reptile || 0 },
      { id: 'insect', name: '昆虫', icon: '🐜', count: countMap.insect || 0 },
    ];

    return success(res, list);
  } catch {
    return fail(res, '获取板块失败');
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
