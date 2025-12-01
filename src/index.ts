import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import type { AuthType } from "./lib/auth.js";
import { getMergedOpenAPISchema, SECURITY_SCHEME } from "./lib/openapi.js";
import { sessionMiddleware } from "./middleware/session.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";
import samplesRoutes from "./routes/samples.js";

const PORT = 3000;

const app = new OpenAPIHono<{
  Variables: AuthType;
}>();

// Middleware
app.use("*", sessionMiddleware);

// Routes (chained for RPC type inference)
const routes = app
  .get("/", (c) => c.text("Hello Hono!"))
  .route("/api/auth", authRoutes)
  .route("/api/sessions", sessionRoutes)
  .route("/api/samples", samplesRoutes);

// OpenAPI
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", SECURITY_SCHEME);
app.get("/api/doc", async (c) => c.json(await getMergedOpenAPISchema(app)));
app.get("/api/ui", swaggerUI({ url: "/api/doc" }));

export default app;
export type AppType = typeof routes;

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
