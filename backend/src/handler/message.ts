import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';
import { createNotification } from '../lib/notify';

export async function handleCreateConversation(req: Request, res: Response) {
  try {
    const targetId = parseInt(String(req.params.userId));
    const userId = req.user!.userId;

    if (targetId === userId) return fail(res, '不能和自己聊天');

    const [u1, u2] = userId < targetId ? [userId, targetId] : [targetId, userId];

    const existing = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    });
    if (existing) return success(res, existing);

    const conv = await prisma.conversation.create({
      data: { user1Id: u1, user2Id: u2 },
      include: {
        user1: { select: { id: true, nickname: true, avatar: true } },
        user2: { select: { id: true, nickname: true, avatar: true } },
      },
    });
    return success(res, conv, 201);
  } catch {
    return fail(res, '创建会话失败');
  }
}

export async function handleGetConversations(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const convs = await prisma.conversation.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      orderBy: { lastMsgAt: 'desc' },
      include: {
        user1: { select: { id: true, nickname: true, avatar: true } },
        user2: { select: { id: true, nickname: true, avatar: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const result = await Promise.all(convs.map(async (c) => {
      const unread = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, isRead: false },
      });
      return { ...c, unreadCount: unread };
    }));

    return success(res, result);
  } catch {
    return fail(res, '获取会话列表失败');
  }
}

const sendMsgSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function handleSendMessage(req: Request, res: Response) {
  try {
    const convId = parseInt(String(req.params.id));
    const body = sendMsgSchema.parse(req.body);
    const userId = req.user!.userId;

    const conv = await prisma.conversation.findUnique({ where: { id: convId } });
    if (!conv) return fail(res, '会话不存在', 40401, 404);
    if (Number(conv.user1Id) !== userId && Number(conv.user2Id) !== userId) {
      return fail(res, '无权发送', 40301, 403);
    }

    const msg = await prisma.message.create({
      data: { conversationId: convId, senderId: userId, content: body.content },
      include: { sender: { select: { id: true, nickname: true, avatar: true } } },
    });

    await prisma.conversation.update({ where: { id: convId }, data: { lastMsgAt: new Date() } });

    const recipientId = Number(conv.user1Id) === userId ? Number(conv.user2Id) : Number(conv.user1Id);
    await createNotification({
      userId: recipientId,
      type: 'system',
      actorId: userId,
      targetType: 'message',
      targetId: convId,
      content: '发来一条消息',
    });

    return success(res, msg, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '发送失败');
  }
}

export async function handleGetMessages(req: Request, res: Response) {
  try {
    const convId = parseInt(String(req.params.id));
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize)) || 30));

    const conv = await prisma.conversation.findUnique({ where: { id: convId } });
    if (!conv) return fail(res, '会话不存在', 40401, 404);
    if (Number(conv.user1Id) !== userId && Number(conv.user2Id) !== userId) {
      return fail(res, '无权访问', 40301, 403);
    }

    // Mark messages as read that weren't sent by current user
    await prisma.message.updateMany({
      where: { conversationId: convId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { sender: { select: { id: true, nickname: true, avatar: true } } },
      }),
      prisma.message.count({ where: { conversationId: convId } }),
    ]);

    return success(res, { data: messages.reverse(), total, page, page_size: pageSize });
  } catch {
    return fail(res, '获取消息失败');
  }
}
