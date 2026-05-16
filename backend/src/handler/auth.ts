import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthService } from '../service/auth';
import { success, fail } from '../pkg/response';

const authService = new AuthService();

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位').max(32),
  nickname: z.string().min(1, '昵称不能为空').max(50),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1),
});

export async function handleRegister(req: Request, res: Response) {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body.email, body.password, body.nickname);
    return success(res, result, 201);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '注册失败');
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    return success(res, result);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '登录失败');
  }
}

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(32),
});

export async function handleChangePassword(req: Request, res: Response) {
  try {
    const body = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return fail(res, '用户不存在', 40401, 404);
    const valid = await bcrypt.compare(body.oldPassword, user.passwordHash || '');
    if (!valid) return fail(res, '原密码错误');
    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return success(res, null);
  } catch (err) {
    if (err instanceof z.ZodError) return fail(res, err.errors[0].message);
    return fail(res, '修改失败');
  }
}

export async function handleGetProfile(req: Request, res: Response) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    return success(res, user);
  } catch (err) {
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '获取用户信息失败');
  }
}
