import type { FC } from "hono/jsx";
import { Layout } from "./Layout.js";

type SignInOTPProps = {
  error?: string;
  email?: string;
  step?: "email" | "otp";
  message?: string;
};

const SignInOTP: FC<SignInOTPProps> = ({ error, email, step = "email", message }) => {
  return (
    <Layout title="Sign In with OTP">
      <div class="max-w-md mx-auto mt-10">
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h1 class="text-2xl font-bold mb-6 text-center">OTPでサインイン</h1>

          {error && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {message && (
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          {step === "email" ? (
            <form action="/ui/otp-signin" method="post" class="space-y-4">
              <input type="hidden" name="action" value="send-otp" />
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                OTPを送信
              </button>
            </form>
          ) : (
            <form action="/ui/otp-signin" method="post" class="space-y-4">
              <input type="hidden" name="action" value="verify-otp" />
              <input type="hidden" name="email" value={email} />
              
              <div class="text-center mb-4">
                <p class="text-gray-600">
                  <span class="font-medium">{email}</span> にOTPを送信しました
                </p>
              </div>

              <div>
                <label
                  for="otp"
                  class="block text-sm font-medium text-gray-700"
                >
                  ワンタイムパスワード
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  autocomplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                サインイン
              </button>

              <div class="text-center mt-4">
                <a
                  href="/ui/otp-signin"
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  別のメールアドレスを使用
                </a>
              </div>
            </form>
          )}

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              パスワードでサインインしますか？{" "}
              <a href="/ui/signin" class="text-blue-600 hover:text-blue-500">
                通常のサインイン
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignInOTP;
