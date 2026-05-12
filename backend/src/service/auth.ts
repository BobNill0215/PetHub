import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../pkg/jwt';

export class AuthService {
  async register(phone: string, password: string, nickname: string) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw new Error('该手机号已注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { phone, passwordHash, nickname },
    });

    const token = signToken({
      userId: Number(user.id),
      uuid: user.uuid,
      role: user.role,
    });

    return { token, user: this.sanitize(user) };
  }

  async login(phone: string, password: string) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new Error('手机号未注册');
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) {
      throw new Error('密码错误');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({
      userId: Number(user.id),
      uuid: user.uuid,
      role: user.role,
    });

    return { token, user: this.sanitize(user) };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pets: true },
    });
    if (!user) throw new Error('用户不存在');
    return this.sanitize(user);
  }

  private sanitize(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
