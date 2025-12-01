import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, emailOTP } from 'better-auth/plugins';
import { db } from '../db/index.js';
import { v7 as uuidv7 } from 'uuid';
import { sendEmail } from './email.js';

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <h1>Reset your password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">${url}</a>
        `,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `
          <h1>Verify your email</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${url}">${url}</a>
        `,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
  plugins: [
    openAPI(),
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // 5分
      sendVerificationOnSignUp: false,
      disableSignUp: false, // OTPでの新規登録を許可
      async sendVerificationOTP({ email, otp, type }) {
        const subjects: Record<string, string> = {
          'sign-in': 'サインイン用ワンタイムパスワード',
          'email-verification': 'メール確認用ワンタイムパスワード',
          'forget-password': 'パスワードリセット用ワンタイムパスワード',
        };

        const messages: Record<string, string> = {
          'sign-in': 'サインインするには、以下のワンタイムパスワードを入力してください。',
          'email-verification': 'メールアドレスを確認するには、以下のワンタイムパスワードを入力してください。',
          'forget-password': 'パスワードをリセットするには、以下のワンタイムパスワードを入力してください。',
        };

        await sendEmail({
          to: email,
          subject: subjects[type] || 'ワンタイムパスワード',
          html: `
            <h1>${subjects[type] || 'ワンタイムパスワード'}</h1>
            <p>${messages[type] || '以下のワンタイムパスワードを入力してください。'}</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; background-color: #f5f5f5; padding: 16px; text-align: center;">${otp}</p>
            <p>このコードは5分間有効です。</p>
            <p>このメールに心当たりがない場合は、無視してください。</p>
          `,
        });
      },
    }),
  ],
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
