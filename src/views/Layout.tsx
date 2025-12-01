import type { FC, PropsWithChildren } from "hono/jsx";

type LayoutProps = PropsWithChildren<{
  title?: string;
}>;

export const Layout: FC<LayoutProps> = ({ children, title = "Better Auth Sandbox" }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 min-h-screen">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <a href="/ui" class="text-xl font-bold text-gray-900">
                  Better Auth Sandbox
                </a>
              </div>
              <div class="flex items-center space-x-4">
                <a href="/ui" class="text-gray-600 hover:text-gray-900">Home</a>
                <a href="/ui/signin" class="text-gray-600 hover:text-gray-900">Sign In</a>
                <a href="/ui/otp-signin" class="text-gray-600 hover:text-gray-900">OTP Sign In</a>
                <a href="/ui/signup" class="text-gray-600 hover:text-gray-900">Sign Up</a>
              </div>
            </div>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
};
