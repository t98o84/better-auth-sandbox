import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import type { AuthType } from "../lib/auth.js";
import { auth } from "../lib/auth.js";
import { Home } from "../views/Home.js";
import { SignIn } from "../views/SignIn.js";
import { SignUp } from "../views/SignUp.js";

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
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (response.token) {
      setCookie(c, "better_auth_session_token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
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
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/ui",
      },
    });

    if (response.token) {
      setCookie(c, "better_auth_session_token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
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

  deleteCookie(c, "better_auth_session_token", {
    path: "/",
  });

  return c.redirect("/ui");
});

export default app;
