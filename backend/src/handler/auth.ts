import { Request, Response } from 'express';
import { z } from 'zod';
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

export async function handleGetProfile(req: Request, res: Response) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    return success(res, user);
  } catch (err) {
    if (err instanceof Error) return fail(res, err.message);
    return fail(res, '获取用户信息失败');
  }
}
