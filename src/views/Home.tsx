import type { FC } from "hono/jsx";
import { Layout } from "./Layout.js";
import type { AuthType } from "../lib/auth.js";

type HomeProps = AuthType;

export const Home: FC<HomeProps> = ({ user, session }) => {
  return (
    <Layout title="Home - Better Auth Sandbox">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Better Auth Sandbox</h1>
        
        {user ? (
          <div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 class="text-lg font-semibold text-green-800 mb-2">✅ Authenticated</h2>
              <p class="text-green-700">You are signed in as <strong>{user.email}</strong></p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">User Info</h3>
                <dl class="space-y-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">ID</dt>
                    <dd class="text-sm text-gray-900 font-mono">{user.id}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Email</dt>
                    <dd class="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Name</dt>
                    <dd class="text-sm text-gray-900">{user.name || "Not set"}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Email Verified</dt>
                    <dd class="text-sm text-gray-900">{user.emailVerified ? "Yes" : "No"}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Created At</dt>
                    <dd class="text-sm text-gray-900">{new Date(user.createdAt).toLocaleString("ja-JP")}</dd>
                  </div>
                </dl>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Session Info</h3>
                {session && (
                  <dl class="space-y-2">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Session ID</dt>
                      <dd class="text-sm text-gray-900 font-mono break-all">{session.id}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Token</dt>
                      <dd class="text-sm text-gray-900 font-mono break-all">{session.token.substring(0, 20)}...</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Expires At</dt>
                      <dd class="text-sm text-gray-900">{new Date(session.expiresAt).toLocaleString("ja-JP")}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">IP Address</dt>
                      <dd class="text-sm text-gray-900">{session.ipAddress || "Unknown"}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">User Agent</dt>
                      <dd class="text-sm text-gray-900 break-all">{session.userAgent || "Unknown"}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>

            <div class="mt-6">
              <form action="/ui/signout" method="post">
                <button
                  type="submit"
                  class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h2 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ Not Authenticated</h2>
              <p class="text-yellow-700">Please sign in to access your account.</p>
            </div>

            <div class="flex space-x-4">
              <a
                href="/ui/signin"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </a>
              <a
                href="/ui/signup"
                class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
