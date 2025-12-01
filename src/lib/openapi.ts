import type { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "./auth.js";

export const OPENAPI_CONFIG = {
  openapi: "3.0.0" as const,
  info: {
    version: "1.0.0",
    title: "Better Auth Sandbox API",
    description: "API documentation for Better Auth Sandbox",
  },
};

export const SECURITY_SCHEME = {
  type: "http" as const,
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Enter your session token",
};

/**
 * Better Auth の basePath（マウントパス）
 */
const BETTER_AUTH_BASE_PATH = "/api/auth";

/**
 * Better Auth のスキーマを取得し、タグ名を変更する
 */
async function getBetterAuthSchema() {
  const authSchema = await auth.api.generateOpenAPISchema();

  // "Default" タグを "Auth" に変更し、パスに basePath プレフィックスを追加
  const paths = Object.fromEntries(
    Object.entries(authSchema.paths || {}).map(([path, methods]) => [
      `${BETTER_AUTH_BASE_PATH}${path}`,
      Object.fromEntries(
        Object.entries(methods as Record<string, unknown>).map(([method, config]) => [
          method,
          {
            ...(config as Record<string, unknown>),
            tags: ((config as Record<string, unknown>).tags as string[] || []).map((tag: string) =>
              tag === "Default" ? "Auth" : tag
            ),
          },
        ])
      ),
    ])
  );

  const tags = (authSchema.tags || []).map((tag: { name: string; description?: string }) =>
    tag.name === "Default"
      ? { ...tag, name: "Auth", description: "Authentication endpoints provided by Better Auth" }
      : tag
  );

  return { paths, tags, components: authSchema.components };
}

/**
 * アプリケーションと Better Auth のスキーマをマージする
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMergedOpenAPISchema(app: OpenAPIHono<any, any, any>) {
  const appSchema = app.getOpenAPIDocument(OPENAPI_CONFIG);
  const authSchema = await getBetterAuthSchema();

  return {
    ...appSchema,
    paths: {
      ...appSchema.paths,
      ...authSchema.paths,
    },
    components: {
      ...appSchema.components,
      schemas: {
        ...appSchema.components?.schemas,
        ...authSchema.components?.schemas,
      },
      securitySchemes: {
        ...appSchema.components?.securitySchemes,
        ...authSchema.components?.securitySchemes,
      },
    },
    tags: [
      ...(appSchema.tags || []),
      ...authSchema.tags,
    ],
  };
}
