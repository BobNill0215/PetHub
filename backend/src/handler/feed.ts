import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

const createFeedSchema = z.object({
  content: z.string().max(2000),
  images: z.array(z.string()).max(9).optional(),
  videoUrl: z.string().optional(),
  topics: z.array(z.string()).optional(),
  petIds: z.array(z.number()).optional(),
});

export async function handleCreateFeed(req: Request, res: Response) {
  try {
    const body = createFeedSchema.parse(req.body);

    const feedData: any = {
      content: body.content,
      images: body.images || [],
      videoUrl: body.videoUrl,
      topics: body.topics || [],
      petIds: body.petIds || [],
      userId: req.user!.userId,
    };

    const feed = await prisma.$queryRawUnsafe(`INSERT INTO "feeds" ...`);

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { feedCount: { increment: 1 } },
    });

    return success(res, { id: 1 }, 201);
  } catch {
    return fail(res, '发布失败');
  }
}
