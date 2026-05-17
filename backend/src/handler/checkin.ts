import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { success, fail } from '../pkg/response';
import { addPoints } from './stats';

export async function handleCheckin(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) return fail(res, '今天已签到');

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const prev = await prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId, date: yesterday } },
    });
    const streak = (prev?.streak || 0) + 1;
    const bonus = streak > 7 ? 5 : streak > 3 ? 3 : 0;
    const points = 5 + bonus;

    await prisma.dailyCheckin.create({ data: { userId, date: today, streak, points } });
    await addPoints(userId, points);

    return success(res, { streak, points, bonus });
  } catch { return fail(res, '签到失败'); }
}

export async function handleGetCheckinStatus(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const checkedIn = await prisma.dailyCheckin.findUnique({ where: { userId_date: { userId, date: today } } });
    const last = await prisma.dailyCheckin.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
    return success(res, { checkedIn: !!checkedIn, streak: last?.streak || 0, todayPoints: checkedIn?.points || 0 });
  } catch { return fail(res, '获取签到状态失败'); }
}
