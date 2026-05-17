import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';

export async function handleBlockUser(req: Request, res: Response) {
  try {
    const blockedId = parseInt(String(req.params.id));
    const blockerId = req.user!.userId;
    if (blockedId === blockerId) return fail(res, '不能屏蔽自己');
    const existing = await prisma.userBlock.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } } });
    if (existing) return fail(res, '已屏蔽');
    await prisma.userBlock.create({ data: { blockerId, blockedId } });
    return success(res, null);
  } catch { return fail(res, '操作失败'); }
}

export async function handleUnblockUser(req: Request, res: Response) {
  try {
    const blockedId = parseInt(String(req.params.id));
    await prisma.userBlock.delete({ where: { blockerId_blockedId: { blockerId: req.user!.userId, blockedId } } });
    return success(res, null);
  } catch { return fail(res, '操作失败'); }
}

export async function handleGetBlockedUsers(req: Request, res: Response) {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: req.user!.userId },
      include: { blocked: { select: { id: true, nickname: true, avatar: true } } },
    });
    return success(res, blocks.map(b => b.blocked));
  } catch { return fail(res, '获取失败'); }
}
