import type { FC } from "hono/jsx";
import { Layout } from "./Layout.js";

type SignInProps = {
  error?: string;
};

export const SignIn: FC<SignInProps> = ({ error }) => {
  return (
    <Layout title="Sign In - Better Auth Sandbox">
      <div class="max-w-md mx-auto">
        <div class="bg-white shadow rounded-lg p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h1>

          {error && (
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-red-700">{error}</p>
            </div>
          )}

          <form action="/ui/signin" method="post" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>

          <div class="mt-6 text-center space-y-2">
            <p class="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/ui/signup" class="text-blue-600 hover:text-blue-700 font-medium">
                Sign Up
              </a>
            </p>
            <p class="text-sm text-gray-600">
              パスワード不要でサインイン？{" "}
              <a href="/ui/otp-signin" class="text-blue-600 hover:text-blue-700 font-medium">
                OTPでサインイン
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
