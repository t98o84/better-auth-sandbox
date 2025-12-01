import { Hono } from "hono";
import { auth, type AuthType } from "../lib/auth.js";

const app = new Hono<{
  Variables: AuthType;
}>()
  .on(["POST", "GET"], "/*", (c) => {
    return auth.handler(c.req.raw);
  });

export default app;
