import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { signToken } from '../pkg/jwt';
import { sendVerificationEmail } from '../lib/email';

export class AuthService {
  async register(email: string, password: string, nickname: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('该邮箱已注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname,
        verificationToken,
        verificationSentAt: new Date(),
      },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      // Log but don't fail - user can resend verification
      console.error('[Email] Failed to send verification:', err);
    }

    return { message: '注册成功，请查收验证邮件', email };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('邮箱未注册');
    }

    if (!user.emailVerifiedAt) {
      throw new Error('请先验证邮箱后再登录');
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

  async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) {
      throw new Error('验证链接无效或已过期');
    }

    const sentAt = user.verificationSentAt;
    if (sentAt && Date.now() - sentAt.getTime() > 24 * 60 * 60 * 1000) {
      throw new Error('验证链接已过期，请重新发送验证邮件');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationSentAt: null,
      },
    });

    const jwtToken = signToken({
      userId: Number(user.id),
      uuid: user.uuid,
      role: user.role,
    });

    return { token: jwtToken, user: this.sanitize(user) };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('该邮箱未注册');
    }
    if (user.emailVerifiedAt) {
      throw new Error('该邮箱已验证通过');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationSentAt: new Date() },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error('[Email] Failed to resend verification:', err);
      throw new Error('验证邮件发送失败，请稍后重试');
    }

    return { message: '验证邮件已发送' };
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
    const { passwordHash, verificationToken, verificationSentAt, ...rest } = user;
    return rest;
  }
}
