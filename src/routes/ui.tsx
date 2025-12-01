import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";
import { Home } from "../views/Home.js";
import { SignIn } from "../views/SignIn.js";
import { SignUp } from "../views/SignUp.js";
import SignInOTP from "../views/SignInOTP.js";

const app = new Hono<{
  Variables: AuthType;
}>();

// Home page
app.get("/", (c) => {
  const user = c.get("user");
  const session = c.get("session");
  return c.html(<Home user={user} session={session} />);
});

// Sign In page
app.get("/signin", (c) => {
  const error = c.req.query("error");
  return c.html(<SignIn error={error} />);
});

// Sign In action
app.post("/signin", async (c) => {
  const body = await c.req.parseBody();
  const email = body.email as string;
  const password = body.password as string;

  try {
    // asResponse: true を使用して Set-Cookie ヘッダーを取得
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: c.req.header(),
      asResponse: true,
    });

    // Better Auth が設定した Set-Cookie ヘッダーを取得
    const setCookieHeader = response.headers.get('set-cookie');
    
    if (setCookieHeader) {
      const redirectResponse = c.redirect("/ui");
      redirectResponse.headers.set('Set-Cookie', setCookieHeader);
      return redirectResponse;
    }

    return c.redirect("/ui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    return c.redirect(`/ui/signin?error=${encodeURIComponent(message)}`);
  }
});

// Sign Up page
app.get("/signup", (c) => {
  const error = c.req.query("error");
  return c.html(<SignUp error={error} />);
});

// Sign Up action
app.post("/signup", async (c) => {
  const body = await c.req.parseBody();
  const name = body.name as string;
  const email = body.email as string;
  const password = body.password as string;
  const confirmPassword = body.confirmPassword as string;

  if (password !== confirmPassword) {
    return c.redirect(`/ui/signup?error=${encodeURIComponent("Passwords do not match")}`);
  }

  try {
    // asResponse: true を使用して Set-Cookie ヘッダーを取得
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/ui",
      },
      headers: c.req.raw.headers,
      asResponse: true,
    });

    // Better Auth が設定した Set-Cookie ヘッダーを取得
    const setCookieHeader = response.headers.get('set-cookie');
    
    if (setCookieHeader) {
      const redirectResponse = c.redirect("/ui");
      redirectResponse.headers.set('Set-Cookie', setCookieHeader);
      return redirectResponse;
    }

    return c.redirect("/ui");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return c.redirect(`/ui/signup?error=${encodeURIComponent(message)}`);
  }
});

// Sign Out action
app.post("/signout", async (c) => {
  const session = c.get("session");

  if (session) {
    try {
      await auth.api.signOut({
        headers: c.req.raw.headers,
      });
    } catch {
      // Ignore errors during sign out
    }
  }

  deleteCookie(c, "better-auth.session_token", {
    path: "/",
  });

  return c.redirect("/ui");
});

// OTP Sign In page
app.get("/otp-signin", (c) => {
  const error = c.req.query("error");
  const message = c.req.query("message");
  return c.html(<SignInOTP error={error} message={message} />);
});

// OTP Sign In action
app.post("/otp-signin", async (c) => {
  const body = await c.req.parseBody();
  const action = body.action as string;
  const email = body.email as string;

  if (action === "send-otp") {
    try {
      await auth.api.sendVerificationOTP({
        body: {
          email,
          type: "sign-in",
        },
      });

      return c.html(
        <SignInOTP
          step="otp"
          email={email}
          message="OTPをメールに送信しました。確認してください。"
        />
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTPの送信に失敗しました";
      return c.html(<SignInOTP error={message} email={email} />);
    }
  }

  if (action === "verify-otp") {
    const otp = body.otp as string;

    try {
      // asResponse: true を使用してSet-Cookieヘッダーを取得
      // headers を渡すことで Cookie が正しく処理される
      const response = await auth.api.signInEmailOTP({
        body: {
          email,
          otp,
        },
        headers: c.req.raw.headers,
        asResponse: true,
      });

      // Better Auth が設定した Set-Cookie ヘッダーを取得
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('[OTP] Set-Cookie header:', setCookieHeader);
      
      if (setCookieHeader) {
        // レスポンスにSet-Cookieヘッダーをコピー
        const redirectResponse = c.redirect("/ui");
        redirectResponse.headers.set('Set-Cookie', setCookieHeader);
        return redirectResponse;
      }

      return c.redirect("/ui");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTPの検証に失敗しました";
      return c.html(<SignInOTP step="otp" email={email} error={message} />);
    }
  }

  return c.redirect("/ui/otp-signin");
});

export default app;
