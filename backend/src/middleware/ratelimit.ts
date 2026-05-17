import { Request, Response, NextFunction } from 'express';
import { fail } from '../pkg/response';

const recentPosts = new Map<number, number[]>();

export function postRateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  if (!userId) return next();

  const now = Date.now();
  const userPosts = recentPosts.get(userId) || [];
  const recent = userPosts.filter(t => now - t < 60000); // last 60 seconds

  if (recent.length >= 5) {
    return fail(res, '发帖过于频繁，请稍后再试', 40029, 429);
  }

  recent.push(now);
  recentPosts.set(userId, recent);
  next();
}
