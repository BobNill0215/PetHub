import { prisma } from './prisma';

interface NotifyParams {
  userId: number;       // 通知接收者
  type: 'like' | 'comment' | 'follow' | 'system';
  actorId: number;      // 触发者
  targetType?: string;
  targetId?: number;
  content: string;
}

export async function createNotification(params: NotifyParams) {
  // Don't notify yourself
  if (params.userId === params.actorId) return;

  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      actorId: params.actorId,
      targetType: params.targetType,
      targetId: params.targetId,
      content: params.content,
    },
  });
}
