import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyLink = `${frontendUrl}/verify?token=${token}`;

  await transporter.sendMail({
    from: `"PetHub" <${process.env.SMTP_FROM || 'noreply@pethub.app'}>`,
    to,
    subject: '验证你的邮箱 - PetHub',
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;font-family:sans-serif">
        <div style="text-align:center;font-size:32px;margin-bottom:16px">🐾</div>
        <h1 style="font-size:20px;text-align:center;color:#1f2937">欢迎加入 PetHub！</h1>
        <p style="color:#6b7280;text-align:center;margin:16px 0">
          请点击下方按钮验证你的邮箱地址
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${verifyLink}"
             style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:16px">
            验证邮箱
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center">
          如果按钮无法点击，请复制以下链接到浏览器：<br>
          <span style="color:#6b7280">${verifyLink}</span>
        </p>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
          此链接 24 小时内有效
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"PetHub" <${process.env.SMTP_FROM || 'noreply@pethub.app'}>`,
    to,
    subject: '重置密码 - PetHub',
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;font-family:sans-serif">
        <h1 style="font-size:20px;text-align:center;color:#1f2937">重置密码</h1>
        <p style="color:#6b7280;text-align:center;margin:16px 0">
          请点击下方按钮重置你的密码
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetLink}"
             style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:16px">
            重置密码
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center">
          如果按钮无法点击，请复制以下链接到浏览器：<br>
          <span style="color:#6b7280">${resetLink}</span>
        </p>
      </div>
    `,
  });
}
