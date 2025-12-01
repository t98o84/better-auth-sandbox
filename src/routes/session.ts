import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { AuthType } from "../lib/auth.js";

// ==================================================
// Schemas
// ==================================================
const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("User");

const SessionSchema = z
  .object({
    id: z.string().uuid(),
    expiresAt: z.string().datetime(),
    token: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    userId: z.string().uuid(),
  })
  .openapi("Session");

const SessionResponseSchema = z
  .object({
    session: SessionSchema,
    user: UserSchema,
  })
  .openapi("SessionResponse");

const UnauthorizedSchema = z
  .object({
    error: z.string().openapi({ example: "Unauthorized" }),
  })
  .openapi("Unauthorized");

// ==================================================
// Routes
// ==================================================
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Sessions"],
  summary: "Get current session",
  description: "Retrieve the current user session and user information",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SessionResponseSchema,
        },
      },
      description: "Current session and user",
    },
    401: {
      content: {
        "application/json": {
          schema: UnauthorizedSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

// ==================================================
// App
// ==================================================
const app = new OpenAPIHono<{
  Variables: AuthType;
}>().openapi(getMeRoute, (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json(
    {
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
        token: session.token,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        userId: session.userId,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    },
    200
  );
});

export default app;
